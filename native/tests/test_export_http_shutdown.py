import io
import pathlib
import sys
import threading
import unittest
from http.server import BaseHTTPRequestHandler
from types import SimpleNamespace
from unittest.mock import Mock, patch

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import export_session


class HandlerCaptured(Exception):
    pass


class ExportHttpShutdownTests(unittest.TestCase):
    def setUp(self):
        handlers, events = [], []
        event_type = threading.Event
        self.session = Mock(frame_size=4)

        def event():
            result = event_type()
            events.append(result)
            return result

        def server(_address, handler):
            handlers.append(handler)
            raise HandlerCaptured()

        with (
            patch.object(export_session, 'ExportSession', return_value=self.session),
            patch.object(export_session, 'resolve_system_ffmpeg', return_value='ffmpeg'),
            patch.object(export_session, 'ThreadingHTTPServer', side_effect=server),
            patch.object(export_session.secrets, 'token_urlsafe', return_value='test-token'),
            patch.object(export_session.threading, 'Event', side_effect=event),
            patch.object(export_session.sys, 'stdin', SimpleNamespace(buffer=io.BytesIO(b'{}\n'))),
        ):
            with self.assertRaises(HandlerCaptured):
                export_session.run_export_session()
        self.completed = events[1]
        self.handler = object.__new__(handlers[0])
        self.handler.close_connection = False

    def test_completed_idle_reset_closes_connection(self):
        self.completed.set()
        self.handler.raw_requestline = b'GET /previous HTTP/1.1\r\n'
        with patch.object(BaseHTTPRequestHandler, 'handle_one_request', side_effect=ConnectionResetError(10054, 'reset')):
            self.handler.handle_one_request()
        self.assertTrue(self.handler.close_connection)

    def test_reset_before_export_completion_remains_an_error(self):
        error = ConnectionResetError(10054, 'reset')
        with patch.object(BaseHTTPRequestHandler, 'handle_one_request', side_effect=error):
            with self.assertRaises(ConnectionResetError) as caught:
                self.handler.handle_one_request()
        self.assertIs(caught.exception, error)

    def test_reset_during_request_after_completion_remains_an_error(self):
        self.completed.set()
        error = ConnectionResetError(10054, 'response write failed')

        def request():
            self.handler.raw_requestline = b'POST /test-token/finish HTTP/1.1\r\n'
            raise error

        with patch.object(BaseHTTPRequestHandler, 'handle_one_request', side_effect=request):
            with self.assertRaises(ConnectionResetError) as caught:
                self.handler.handle_one_request()
        self.assertIs(caught.exception, error)

    def test_other_errors_after_completion_remain_errors(self):
        self.completed.set()
        for error in (BrokenPipeError('write failed'), EOFError('short frame'), OSError('I/O failed')):
            with self.subTest(error=type(error).__name__):
                with patch.object(BaseHTTPRequestHandler, 'handle_one_request', side_effect=error):
                    with self.assertRaises(type(error)) as caught:
                        self.handler.handle_one_request()
                self.assertIs(caught.exception, error)

    def test_encoder_failure_is_returned_as_http_error(self):
        self.session.finish.side_effect = RuntimeError('Encoder exited 1')
        self.handler.path, self.handler.command = '/test-token/finish', 'POST'
        self.handler.respond = Mock()
        self.handler.handle_request()
        self.handler.respond.assert_called_once_with(500, b'Encoder exited 1', 'text/plain')
        self.assertFalse(self.completed.is_set())

    def test_short_frame_is_returned_as_http_error(self):
        self.session.write.side_effect = EOFError('Missing output frame')
        self.handler.path, self.handler.command = '/test-token/frame/0', 'POST'
        self.handler.headers, self.handler.rfile = {'Content-Length': '4'}, io.BytesIO(b'')
        self.handler.respond = Mock()
        self.handler.handle_request()
        self.handler.respond.assert_called_once_with(500, b'Missing output frame', 'text/plain')
        self.assertFalse(self.completed.is_set())


if __name__ == '__main__':
    unittest.main()
