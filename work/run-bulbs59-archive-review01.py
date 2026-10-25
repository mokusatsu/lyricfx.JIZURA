import subprocess,json
w=['python','-B','work/avoid009-night-command-receipts01/command_receipt.py']
for rid,cmd in [('bulbs59-archive01',['python','-B','work/archive-bulbs59-output01.py','--manifest-sha256','9c228e33ddea86851c4cf6cae5ffe61bc7debfddb0ca1b30121a2760844976b1']),('bulbs59-parent-review01',['python','-B','work/parent-review-bulbs59.py'])]:
 subprocess.run(w+['--receipt-id',rid,'--argv-json',json.dumps(cmd)],check=True)
