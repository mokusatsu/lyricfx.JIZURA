# AVOID-008 固定translation・限定画像照合

判定：**限定FAIL（bookSpineの下端crop増加）**。比較対象はbookSpine row118、cassette row261、polaroid row274の各0.25 / 1.75 / 3.8秒、旧accepted859source対新c861統合mainの9組18 PNGのみ。全画像を`view_image(detail="original")`で原寸確認した。画像の生成・加工・再encode・contact sheet・HTML/動画再生は行っていない。

- bookSpine：主文字「Beyond the blue sky」、巻数24、主文字枠と本の相対関係は保持。全体が約28.3px下がり、0.25秒では旧で下端に見えていた最下段の帯が画面外へ消える。1.75秒と3.8秒では旧で全高見えていた主文字より下の装飾本1冊が下端で切れる。旧にもさらに下の本のcropは存在するが、afterではcropの及ぶ本が増えている。primaryの可読性維持と、独立装飾を含む画面構図の退行は別に扱う。新cropを許容済みにはしない。
- cassette：全体が約13.6px左へ移動。3時刻とも文字、Aラベル、帯・リール・枠・微小注記の相対関係と読み順は維持し、新たなstage端cropや目に見える変形は認めない。
- polaroid：全体が約69.9px右・約9.9px上へ移動。3時刻とも写真枠、テープ、文字、No.01-1 / No.01-2 / 00:00.00の関係を維持。右余白は減るが新cropは認めない。earlyで2枚が見え、hold/exitで3枚が揃う段階も維持。

円ガイドは全18画像に描かれていないため、円とのclearanceは画像だけでは判定できない。文字・注記と物体内の装飾円の見え方はbefore/afterで維持している。3静止時刻で入場途中・保持・退場時点の構成を比較しただけで、連続時間の動きの意図や実時間再生は未確認。

manifest SHA256 `83c23906449d62ded3780f7d70915b49b13fbb17ccd0e296c9b6faaf396731b5`を実バイト照合。18画像全てのSHA256・PNG原寸寸法、audit SHA256、audit内98件のsource / fixture / font pins、旧gzip展開後compiled・現行compiledを実バイト一致確認した。対象3 fixture specとaudit各frameのnativePNGSHA256も画像に一致。詳細は`translation-visual01-metadata.json`。bookSpine 1260×540、他2種960×540。

この結果を全34 layout、他fixture、全時間、数値の円回避安全性・ownership・clock等の親監査、フォント全般、動画再生のPASSには拡張しない。公開結果確認は利用者指示により恒久中止・対象外。ブラウザ・公開URLへアクセスしていない。product/source/Git/indexは変更していない。
