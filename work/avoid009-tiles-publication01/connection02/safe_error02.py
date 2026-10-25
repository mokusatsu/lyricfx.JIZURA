"""Pure fixed-schema Git error classifier; never returns raw stderr or URLs."""
import hashlib,re

def classify(stderr,returncode):
 data=stderr if isinstance(stderr,bytes) else b''
 text=data.decode('utf-8',errors='replace').lower()
 statuses=set()
 for pattern in [r'returned error:\s*([1-5][0-9]{2})\b',r'http(?:/[0-9.]+| code)?\s+([1-5][0-9]{2})\b',r'connect tunnel failed, response\s+([1-5][0-9]{2})\b']:
  statuses.update(int(x) for x in re.findall(pattern,text))
 explicit_expiry=bool(re.search(r'(?:token|credential|authorization)[^\r\n]{0,80}(?:expired|expiration)',text))
 proxy=bool(re.search(r'connect tunnel failed|proxy connect|could not resolve proxy|failed to connect to proxy|from proxy after connect',text))
 redirect=bool(re.search(r'redirection|redirect(?:ed|s|ing)?|http\.followredirects',text))
 config=bool(re.search(r'bad config|invalid config|invalid value for|unsupported proxy syntax|unable to read config',text))
 auth=bool(re.search(r'authentication failed|authorization failed|could not read username|access denied',text)) or bool(statuses & {401,403})
 category='AUTH_EXPIRY_REPORTED' if explicit_expiry else 'PROXY_CONNECT' if proxy else 'REDIRECT_REPORTED' if redirect else 'CONFIG_REPORTED' if config else 'AUTH_REPORTED' if auth else 'GIT_ERROR_UNCLASSIFIED'
 return {'errorType':'GitCommandFailure','category':category,'httpStatuses':sorted(statuses),'explicitCredentialExpiryText':explicit_expiry,'proxyConnectText':proxy,'redirectText':redirect,'configText':config,'returncode':int(returncode),'stderrSHA256':hashlib.sha256(data).hexdigest()}
