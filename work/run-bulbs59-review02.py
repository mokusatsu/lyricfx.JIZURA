import subprocess,json
w=['python','-B','work/avoid009-night-command-receipts01/command_receipt.py']
for rid,cmd in [('bulbs59-storage-recovery02',['python','-B','work/recover-bulbs59-storage02.py']),('bulbs59-parent-review01',['python','-B','work/parent-review-bulbs59.py'])]:
 subprocess.run(w+['--receipt-id',rid,'--argv-json',json.dumps(cmd)],check=True)
