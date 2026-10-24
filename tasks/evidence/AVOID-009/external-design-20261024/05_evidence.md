# 調査根拠・固定版・未確認事項

## 1. 固定した版とアクセス範囲

調査基準日は2026年10月24日（セッション指定日、UTC）。GitHubのworkブランチの開始時先端を取得し、以後のソース取得は全て同じ完全コミットIDに固定した。

| 項目 | 記録 |
|---|---|
| リポジトリ | `mokusatsu/lyricfx.JIZURA` |
| ブランチ | `work` |
| 調査固定コミット | `e44551ae2d3fabd599f29f5f81de8b8ed5fc053e` |
| 提示されていた参照コミット | `8a13b3c16a38cb484a64b4787ba62353f9ca3db8`（短縮形`8a13b3c1`） |
| 比較結果 | 固定コミットが1コミットahead、behind=0。参照コミットがmerge base |
| 変更ファイル | 38ファイル。`src/`の変更0、`dev/avoidance/contract.json`の変更0 |
| 指定ローカル作業場所 | `/workspace/lyricfx.JIZURA`はこの調査環境に存在しなかった |
| 親作業ツリーのHEAD・未コミット差分 | 未確認。GitHub上の状態から推定しない |
| 読み取り方式 | リポジトリの読み取り機能でcommit指定の各fileを取得。指定ローカル作業ツリーでの`git show`は未使用 |
| 対象の実アクセス | 固定コミットのソース・文書を実際に取得し内容を読んだ。URL名だけによる推定ではない |

基準差分は[固定コミット間の比較](https://github.com/mokusatsu/lyricfx.JIZURA/compare/8a13b3c16a38cb484a64b4787ba62353f9ca3db8...e44551ae2d3fabd599f29f5f81de8b8ed5fc053e)で識別できる。これはソース版の識別であり、公開アプリの接続・HTTP・画面・配信結果の確認ではない。

## 2. 読み取ったファイル

以下の28ファイルを固定コミットから取得した。保存した参照用内容と返されたGit blob IDの対応も28件すべて一致した。これは調査資料の内容同一性の確認であり、製品の描画・実装・安全性の検証ではない。

| ファイル | 行数 | Git blob ID |
|---|---:|---|
| `AGENTS.md` | 69 | `a219158d66984e58e62d97c53a109294514a4086` |
| `.agents/skills/evidence-driven-task-management/SKILL.md` | 122 | `1c8188ed8684c1df774c74690c56a24f719b9a54` |
| `tasks/implementation-review-policy.md` | 43 | `875ab3070d8417870390b24aaa3935753722c674` |
| `tasks/AVOID-009.md` | 426 | `bd0364c25c157e88c7938b9693849621bfc39e8c` |
| `tasks/avoidance-design.md` | 402 | `1fac47ddc044a001ccb6d89af0ebc638ac12f487` |
| `dev/avoidance/contract.json` | 209 | `912afd296fceb3748e003e2b30e54c51f647c28f` |
| `tasks/evidence/AVOID-009/inventory-audit01.md` | 64 | `80e629a8db0f5e44575f95e70d361f5b0036b8fc` |
| `src/11p_layoutsD.js` | 3359 | `e3048ccdffea022cd25ac20c2ab26032e8ae8cae` |
| `src/03_text.js` | 308 | `abd347cee83fd26bb8fc6bcf665f756d1b522df6` |
| `src/09_render.js` | 537 | `fad6bac92b943a9271a9b8a568eb0a17287838a3` |
| `src/02_fonts.js` | 359 | `857910f53c722a7ebc8bec3467e8d670908b8df5` |
| `src/06_layouts.js` | 1000 | `f2353b4c755d338ca3126d2f7f095f22228ac2f0` |
| `src/01_util.js` | 181 | `c13325cf26bb19a389be0134f29900ca79519dca` |
| `src/05_anim.js` | 415 | `4974c91b9707350b896196105ec6da90e3586f39` |
| `src/09a_placement.js` | 487 | `afed3f6aab93b8c27ddb9f81647d5863df223358` |
| `src/09k_layoutsD_placement.js` | 103 | `ccc870f80830f8ac2801b624ab97f4d61f103728` |
| `src/11za_layoutsD_transport.js` | 10 | `6ea61808883c073340bfc7391026a9141e69b153` |
| `src/08ca_lyric_avoidance.js` | 91 | `389dba71b2a3c26c4a32a7c5e41307dcae6935b1` |
| `src/08e_lyric_features.js` | 438 | `debfb09984839d79afb200ba28d63599ddfd78f1` |
| `src/08eb_lyric_scene.js` | 475 | `934abd54ce6cfc5c6bdefcc038e9634e74371053` |
| `src/11p_bgcamB.js` | 1250 | `1bfeb9858ebcabb1039aaa2715af0b32f992e411` |
| `src/11p_treattrans.js` | 1137 | `1a6bfe039660dd0073a52aebdce5dd3e96186917` |
| `src/07_decor.js` | 260 | `394ffac5418ee5a47f0607536cba89bce2cd9849` |
| `src/04_styles.js` | 222 | `bce597939309dfb95a90571a2ccf4454b97fcd04` |
| `src/08_planner.js` | 873 | `38d29fc5b2f208897efed560ba0fdd7274f8929d` |
| `src/05b_registry.js` | 73 | `53d9d63b20826530554df4b76ea5f8a943f81ece` |
| `src/11p_looks.js` | 1291 | `fb214da44322c37e28761c9a19fb851a1159f6f0` |
| `src/02b_lang.js` | 153 | `88ad02790c639f9e6725c19384c7b63968d341a4` |

### 対象ソースへの固定リンク

- [tiles・文字タイル](https://github.com/mokusatsu/lyricfx.JIZURA/blob/e44551ae2d3fabd599f29f5f81de8b8ed5fc053e/src/11p_layoutsD.js#L1507-L1581)
- [bulbs・電球サイン](https://github.com/mokusatsu/lyricfx.JIZURA/blob/e44551ae2d3fabd599f29f5f81de8b8ed5fc053e/src/11p_layoutsD.js#L1583-L1681)
- [billboard・看板](https://github.com/mokusatsu/lyricfx.JIZURA/blob/e44551ae2d3fabd599f29f5f81de8b8ed5fc053e/src/11p_layoutsD.js#L1776-L1852)
- [採用契約](https://github.com/mokusatsu/lyricfx.JIZURA/blob/e44551ae2d3fabd599f29f5f81de8b8ed5fc053e/dev/avoidance/contract.json)
- [rendererのpass・camera](https://github.com/mokusatsu/lyricfx.JIZURA/blob/e44551ae2d3fabd599f29f5f81de8b8ed5fc053e/src/09_render.js#L159-L290)
- [主文字の処理](https://github.com/mokusatsu/lyricfx.JIZURA/blob/e44551ae2d3fabd599f29f5f81de8b8ed5fc053e/src/06_layouts.js#L11-L113)
- [D adapter境界](https://github.com/mokusatsu/lyricfx.JIZURA/blob/e44551ae2d3fabd599f29f5f81de8b8ed5fc053e/src/09k_layoutsD_placement.js#L43-L67)

リンクは根拠となるソース位置を示す。公開済みアプリや確認用サイトの状態を示すものではない。

## 3. 参照コミットからの差分一覧

変更内容の要約は風船の限定承認、継続状況、保存・退避に関する記録、magnetsの診断資料である。対象3演出および共通srcには差分がない。magnetsの診断の成立・妥当性を本調査が追認するものではない。

| 変更パス | 状態 | 追加行 | 削除行 |
|---|---|---:|---:|
| `AGENTS.md` | modified | 12 | 0 |
| `tasks/AVOID-009.md` | modified | 8 | 2 |
| `tasks/evidence/AVOID-009/afternoon-20261024/storage-root-emergency-index07/private-task-index-install-receipt2.json` | added | 10 | 0 |
| `tasks/evidence/AVOID-009/batch-20261023/progress.json` | modified | 74 | 18 |
| `tasks/evidence/AVOID-009/batch-20261023/resume-checkpoint.md` | modified | 5 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/approval-balloon03.json` | added | 10 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/environment-start.json` | added | 14 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/CAPACITY-RESTORE.txt` | added | 36 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/README.txt` | added | 69 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/RELEASE44-REVIEW.txt` | added | 48 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/capacity-additional-plan.json` | added | 156 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/capacity-expanded-plan.json` | added | 792 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/capacity-plan.json` | added | 26 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/capacity-seal.json` | added | 21 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/initial-snapshot.json` | added | 155 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/private_index.py` | added | 127 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/release44-proof.json` | added | 639 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/release44-receipt.json` | added | 152 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/release44-source-seal.json` | added | 16 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/release44.py` | added | 106 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/seal.json` | added | 33 | 0 |
| `tasks/evidence/AVOID-009/evening-20261024/storage01/source_manager.py` | added | 51 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/board24.py` | added | 72 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/evidence/SOURCE-MATH24.md` | added | 21 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/evidence/board24.raw.json.gz` | added | 0 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/evidence/parent-source-gate24.json` | added | 13 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/evidence/pins24.json` | added | 707 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/evidence/preparation-history24.json` | added | 4 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/evidence/seal24.json` | added | 73 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/originals/SOURCE-MATH23.md` | added | 15 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/originals/family23.py` | added | 55 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/originals/pins23.json` | added | 707 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/originals/seal23.json` | added | 31 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/parent-board24-review.json` | added | 19 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/review-board24.py` | added | 28 | 0 |
| `tasks/evidence/AVOID-009/magnets-evening24/runner24.py` | added | 78 | 0 |
| `tasks/reviews/AVOID-009-balloons-stage11.md` | modified | 3 | 1 |
| `tasks/task-list.md` | modified | 2 | 0 |

## 4. 調査で確認したことと確認していないこと

| 区分 | 状態 |
|---|---|
| 指定文書・採用契約の読解 | 実施 |
| tilesの構造・全描画・運動式・共有経路の調査 | 実施。報告の式と所有関係を独立に静的照合 |
| bulbs・billboardの同形式の調査 | 実施。個別報告を作成し、式・所有物・時計・分類を固定ソースへ静的照合 |
| sourceに書かれた定数・式の代入計算 | 実施。実描画の計測値とは区別 |
| 実フォントのTextMetrics・alpha・AA計測 | 未実施 |
| アプリ・ブラウザ・rendererの起動と描画 | 未実施 |
| 画像・動画・画素の照合 | 未実施 |
| 実装・adapter登録・共有描画基盤変更 | 未実施 |
| 既存受入済み演出・magnetsの変更 | 未実施 |
| 共有作業ツリー編集、checkout、commit、push、依存導入 | 未実施 |
| 公開URLへの接続確認・公開HTTP/hash/起動・Pages/Sites polling | 未実施 |
| 追加サイバー審査・Proxy/prototype fuzz | 未実施 |
| 全区間safe／safe-holdの成立認定 | 未実施 |
| AVOID-009の実装完了・人間動作承認 | 本調査の成果には含まれない |

文章の報告書とzipのみを成果物とする。コード変更、実装パッチ、画像・動画、実行済みを装ったログは含まない。

## 5. 実装担当への引継ぎ条件

実装担当は、実際の作業HEADと未コミット差分を改めて確認し、この固定版との差を照合する必要がある。調査中に親側が進めた作業を、本報告のHEADや共有基盤の記述で上書きしない。

最初は各演出のnative catalogとゼロ変位の一致確認を独立した段階とする。文字・物体・メタ情報・影・残像を欠落させず、元の時計と描画順の一致を確認した後で、限定した候補の解析へ進む。計測がない状態で`measurementSupported`や`safe`へ昇格させない。

未解決の主な項目は、実字体のインク境界、動的CSSサイズと形状数の離散境界、cameraを含む厳密支持、再構成後の読順・接触・可読下限、regionごとの保持窓、残留寿命、共有record/replayの対応能力、性能である。個別の優先度と失敗条件は各演出の第4～6節に記載した。
