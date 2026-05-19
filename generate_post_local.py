import json
import urllib.request
import urllib.error
from datetime import datetime
import re
import os
import sys

# 設定
API_BASE_URL = "http://localhost:1234/v1"
API_URL = f"{API_BASE_URL}/chat/completions"

# 日付ベースのテーマリスト（月*32+日でインデックスを決定）
THEMES = [
    "日記の形式で怪談を書いて。一人称の視点で、少しずつ現実が崩れていく様子を描いて。",
    "掲示板のスレッド形式で怪談を書いて。匿名の書き込みが連鎖していく恐怖。",
    "商品レビューの形式で怪談を書いて。ある商品を使った後の不気味な体験。",
    "放送テープの文字起こしで怪談を書いて。学校の放送室から流れ続ける音声。",
    "マニュアルや取扱説明書の形式で怪談を書いて。奇妙な注意事項に気づく恐怖。",
    "LINEのチャットログで怪談を書いて。既読がついたままの奇妙なメッセージ。",
    "検索履歴の形式で怪談を書いて。ある日突然、別人のような検索をする自分。",
    "カメラロールの写真のキャプションで怪談を書いて。撮っていない写真がアルバムに。",
    "レシピブログの形式で怪談を書いて。古いレシピを再現すると何かが起こる。",
    "天気予報の形式で怪談を書いて。予報通りになるはずのない現象が起きる。",
    "SNSの投稿とコメントで怪談を書いて。フォロワーが一人また一人と消えていく。",
    "病院の診察記録で怪談を書いて。医者にも言えない症状と診断。",
    "図書館の貸出カードで怪談を書いて。誰にも読まれない本が借りられていく。",
    "駅のアナウンスと時刻表で怪談を書いて。存在しない列車が運行され始める。",
    "ゲームのセーブデータで怪談を書いて。自分以外のプレイデータが保存されている。",
    "音楽プレイヤーのプレイリストとレビューで怪談を書いて。知らない曲が追加される。",
    "スーパーのPOPとチラシで怪談を書いて。売れ行きが良すぎる商品。",
    "ホテルのゲストブックで怪談を書いて。過去の宿泊客の書き込みが繋がっていく。",
    "カメラのRAW現像で怪談を書いて。肉眼では見えないものが写っている。",
    "水族館の説明プレートで怪談を書いて。展示魚の生態が少しずつ変わっていく。",
    "おみくじの結果と体験談で怪談を書いて。引いたはずないのに大吉が来る。",
    "家電の音声ログで怪談を書いて。操作していない家電が動き始める。",
    "映画のレビューと口コミで怪談を書いて。上映されていない映画の映像。",
    "植物の成長記録で怪談を書いて。育てていない植物が庭に生えている。",
    "スマートウォッチの健康データで怪談を書いて。睡眠中の心拍数に異常が。",
    "郵便物とハガキの形式で怪談を書いて。差出人不明の手紙が毎日来る。",
    "スポーツクラブの記録で怪談を書いて。入室していないのに運動データが。",
    "博物館の展示解説で怪談を書いて。展示物に微妙な変化が現れる。",
    "カフェのメニューと注文履歴で怪談を書いて。廃盤メニューが注文できる。",
    "自動販売機のレシートで怪談を書いて。販売されていない商品が出た。",
    "保育園の連絡帳で怪談を書いて。子供が描いてくる絵が不気味に当たっていく。",
    "カレンダーの予定入力とメモで怪談を書いて。未来の自分が書き込んだ予定。",
    "図書館のレコメンド本棚で怪談を書いて。他人の好みに完璧に合う本が。",
    "音楽教室のレッスン記録で怪談を書いて。練習していない曲が弾けるようになる。",
    "クリーニングの受取票で怪談を書いて。着ていない服が返送されてくる。",
    "ペットの健康記録で怪談を書いて。餌を食べていないのに体重が増える。",
    "温泉の源泉説明と感想帳で怪談を書いて。源泉の成分が年によって違う。",
    "花屋の花言葉カードで怪談を書いて。贈られた花言葉が未来の出来事を示す。",
    "図書館の返却期限通知で怪談を書いて。借りていない本が返却期限に。",
    "カメラのシャッターカウントで怪談を書いて。誰も写していない写真が増える。",
    "病院の検査数値で怪談を書いて。数値が異常なのに本人は元気。",
    "映画館の座席表で怪談を書いて。常に同じ人が同じ席に座っている。",
    "スーパーの棚卸しリストで怪談を書いて。存在しない商品が増えている。",
    "水族館の魚の餌やり記録で怪談を書いて。餌をやっていないのに魚が集まる。",
    "おみくじの返却箱で怪談を書いて。戻ってきたおみくじが全て凶。",
    "家電の消費電力グラフで怪談を書いて。使っていない電器の電力が上昇中。",
    "写真館の現像注文履歴で怪談を書いて。現像していない写真が到着。",
    "動物園の動物の餌やり記録で怪談を書いて。夜中に餌を食べている動物。",
    "図書館の予約リストで怪談を書いて。予約していない本が予約中になる。",
    "音楽プレイヤーのアルバムカバーで怪談を書いて。写真が少しずつ変わっていく。",
    "スーパーの店員メモで怪談を書いて。客に見えない場所で書かれたメモ。",
    "水族館の水槽のガラス清掃記録で怪談を書いて。外側からの跡が。",
    "おみくじの絵柄で怪談を書いて。絵柄が現実の出来事にリンクしていく。",
    "スマートロックの出入りログで怪談を書いて。開閉した記憶のない記録。",
    "病院の処方箋と薬の説明で怪談を書いて。飲んだことのない薬が処方される。",
    "映画のポスターと上映時間表で怪談を書いて。上映されていない映画のポスター。",
    "植物の成長写真と測定記録で怪談を書いて。夜に成長した植物。",
    "スマートウォッチの心拍数グラフで怪談を書いて。起きているのに心拍数が上昇。",
    "郵便物の配達記録で怪談を書いて。配達先はない住所に届く郵便。",
    "スポーツクラブのトレーナーメモで怪談を書いて。来馆していないのに記録が。",
    "博物館の収蔵品管理表で怪談を書いて。移動したはずのない展示品。",
    "カフェのコーヒー豆の在庫で怪談を書いて。減っていないのに在庫が減る。",
    "自動販売機のメンテナンス記録で怪談を書いて。空ではないのに商品が減る。",
    "保育園の給食メニューと食べ残し記録で怪談を書いて。食べていないのに完食。",
    "カレンダーの行事予定と写真で怪談を書いて。写っていないのに写真がある。",
    "図書館の貸出制限通知で怪談を書いて。借りていない本が期限切れに。",
    "音楽教室の生徒の演奏記録で怪談を書いて。練習していない曲が上手に。",
    "クリーニングの衣類の状態写真で怪談を書いて。着ていないのに汚れがある。",
    "ペットのしつけ記録で怪談を書いて。覚えていないコマンドを覚えてる。",
    "温泉の湯温記録と注水記録で怪談を書いて。注水していないのに湯量が減る。",
    "花屋の仕入先と卸し先リストで怪談を書いて。仕入していない花が届く。",
    "図書館の館内放送録音で怪談を書いて。放送していない放送が録音されている。",
    "カメラのレンズ交換履歴とフィルター記録で怪談を書いて。付けた記憶のないフィルター。",
    "病院の診察待ち時間と患者数で怪談を書いて。存在しない患者の待ち時間。",
    "映画館の清掃記録と発見物届で怪談を書いて。誰も持っていかない遺品。",
    "スーパーの鮮度管理と廃棄記録で怪談を書いて。廃棄していないのに賞味期限切れ。",
    "水族館の水槽の水質検査記録で怪談を書いて。検査していない項目が異常値。",
    "おみくじの販売数とジャンル別比率で怪談を書いて。特定の結果だけが異常に多い。",
    "家電の更新ログとバージョン情報で怪談を書いて。更新していないのに変わっている。",
    "写真館の撮影データとメモで怪談を書いて。撮影していないのにデータがある。",
    "動物園の動物の行動記録で怪談を書いて。夜に通常と異なる行動。",
    "図書館の返却箱の整理記録で怪談を書いて。返却していない本が返却箱に。",
    "音楽プレイヤーのシャッフル再生履歴で怪談を書いて。偶然ではない再生順序。",
    "スーパーの店長日報と在庫指示で怪談を書いて。指示していない発注が来る。",
    "水族館の魚の健康診断記録で怪談を書いて。検査していない魚が異常値。",
    "おみくじの絵柄の製造ロットと不良率で怪談を書いて。不良品に意味がある。",
    "スマートロックの電池交換記録と残量履歴で怪談を書いて。電池交換していないのに交換記録。",
    "病院の医師の当直記録で怪談を書いて。当直していないのに署名がある。",
    "映画のスタッフロールとクレジットで怪談を書いて。いない人がクレジットされている。",
    "植物の開花予報と観測記録で怪談を書いて。開花していないのに開花宣言。",
    "スマートウォッチのGPS軌跡で怪談を書いて。行っていない場所に記録がある。",
    "郵便物の配達員メモと備考で怪談を書いて。配達不可能なのに配達完了。",
    "スポーツクラブの機器使用ログで怪談を書いて。利用していないのに使用記録。",
    "博物館の来館者数と入場記録で怪談を書いて。カウントされていない来館者。",
    "カフェのコーヒーの温度と抽出記録で怪談を書いて。提供していないのに提供記録。",
    "自動販売機の売上と品揃え変更履歴で怪談を書いて。変更していない商品が並ぶ。",
    "保育園の保育記録と保護者への連絡で怪談を書いて。子供が話していないことを知っている。",
    "カレンダーの共有予定とコメントで怪談を書いて。共有していない予定にコメントが。",
    "図書館の司書のおすすめ本とメモで怪談を書いて。推薦していない本が推薦されている。",
    "音楽教室の先生の指導メモと評価で怪談を書いて。指導していないのに評価がある。",
    "クリーニングの修復記録と写真で怪談を書いて。修復していないのに修復記録。",
    "ペットのワクチン接種記録と健康診断で怪談を書いて。接種していないのに接種記録。",
    "温泉の混浴日程と入浴者数記録で怪談を書いて。記録にない入浴者の痕跡。",
    "花屋のイベント告知と予約状況で怪談を書いて。開催していないイベントの予約。",
    "図書館の点灯時間と館内照明の電力量で怪談を書いて。閉館後の電力使用。",
    "カメラのWi-Fi転送ログとクラウドバックアップで怪談を書いて。転送していない写真がクラウドに。",
    "病院の手術室の使用予約と実績で怪談を書いて。予約していない手術の実績。",
    "映画館の上映中の館内温度と湿度で怪談を書いて。上映していない館のデータ。",
    "植物の肥料与薬の散布記録で怪談を書いて。散布していないのに散布記録。",
    "スマートウォッチの通知履歴と応答で怪談を書いて。知らないアプリからの通知。",
    "郵便物の差出人分析と頻出地名で怪談を書いて。存在しない地名からの郵便。",
    "スポーツクラブのクラススケジュールと参加者で怪談を書いて。開催していないクラスの参加者。",
    "博物館の展示替日程と出品者リストで怪談を書いて。出品していない人の出品品。",
    "カフェの仕入れと廃棄記録で怪談を書いて。仕入していない商品の廃棄。",
    "自動販売機の除菌清掃記録と消毒液の減り具合で怪談を書いて。清掃していないのに記録がある。",
    "保育園の園児の身長体重測定記録で怪談を読んで。測定していないのに記録がある。",
    "カレンダーのゴミ出し予定と注意書きで怪談を書いて。当日でないのに回収されたゴミ。",
    "図書館の空調運転記録と館内温度で怪談を書いて。閉館後の空調運転。",
    "音楽教室の楽器の調律記録とメンテナンスで怪談を書いて。調律していないのに記録がある。",
    "クリーニングの宅配便の伝票と追跡情報で怪談を書いて。発送していないのに追跡情報。",
    "ペットの散歩ルートと記録時間と天気で怪談を書いて。連れていないのに散歩記録。",
    "温泉の給湯ボイラーの燃料消費量と運転時間で怪談を読んで。停止しているのに燃料消費。",
    "花屋の花束のラッピング素材の在庫と使用量で怪談を書いて。使用していないのに減少。",
    "図書館のインターネット検索ログと検索キーワードで怪談を書いて。利用していない端末の検索。",
    "カメラの画像のEXIF情報と撮影位置とカメラのGPSで怪談を書いて。撮っていない写真の位置情報。",
    "病院の検体の保管記録と温度管理で怪談を読んで。破棄したはずの検体が増えている。",
    "映画館の鍵管理と開閉記録と鍵の紛失報告で怪談を書いて。紛失していないのに報告がある。",
    "植物の日照時間と日射量測定記録で怪談を書いて。測定していないのに記録がある。",
    "スマートウォッチの充電履歴と充電時間と放電率で怪談を書いて。充電していないのに充電記録。",
    "郵便物の配達時間帯と再配達の理由と再配達履歴で怪談を書いて。再配達していないのに記録がある。",
    "スポーツクラブの温水プール水温と塩素濃度とPH値で怪談を読んで。閉鎖中のプールのデータ。",
    "博物館の防犯センサーの作動記録と解除記録で怪談を書いて。作動していないのに記録がある。",
    "カフェのレジの売上とレシートの発行枚数とキャンセルレシートで怪談を書いて。発行していないレシート。",
    "自動販売機の冷却コンプレッサーの運転時間と消費電力と室外機温度で怪談を書いて。停止しているのに運転記録。",
    "保育園の園児の持ち物と忘れ物と届いた物で怪談を書いて。持ってこないはずの物が届く。",
    "カレンダーの祝日と休業日と緊急休業のお知らせで怪談を読んで。休業していないのに休業通知。",
    "図書館の書籍のバーコード登録と貸出タグと返却タグの交換記録で怪談を書いて。交換していないタグ。",
    "音楽教室の教室の気温と湿度と換気回数と窓の開閉記録で怪談を書いて。閉めているのに開閉記録。",
    "クリーニングの衣類の繊維分析と染色検査と生地の縮み率で怪談を読んで。検査していないのに分析結果。",
    "ペットのマイクロチップの登録情報と読み取り記録と感染日と有効期間で怪談を書いて。読み取っていないのに記録。",
    "温泉の源泉の温度とpHとミネラル成分と湧出量と採水日の分析結果で怪談を書いて。採水していないのに分析結果。",
    "花屋の温室の温度と湿度と二酸化炭素濃度と照明時間と開花促進剤の散布記録で怪談を書いて。散布していないのに記録。",
    "図書館の館内の静粛時間と騒音検知センサーの記録と警告出力履歴で怪談を書いて。検知していないのに警告。",
    "カメラのレンズのフォーカス距離と被写界深度と深度マップとオートフォーカスの応答時間で怪談を書いて。測距していないのに記録。",
    "病院の滅菌器の運転記録と温度と圧力とサイクル時間と滅菌失敗の記録で怪談を読んで。失敗していないのに失敗記録。",
    "映画館のスクリーンの明るさと色温度と音声レベルと音声遅延の測定記録で怪談を書いて。測定していないのに記録。",
    "植物の土壌の水分量とpHと養分濃度と根の伸長量と根の異常の記録で怪談を書いて。測定していないのに記録。",
    "スマートウォッチの血中酸素濃度と睡眠段階とREM時間と深睡眠時間と覚醒回数と心拍変動の分析で怪談を書いて。測定していないのにデータ。",
    "郵便物の封筒の消印と到着日と配達日と配送会社と配送ルートと差出地の分析で怪談を書いて。消印がないのに消印がある。",
    "スポーツクラブの入室ICカードのログと退室ICカードのログと入室失敗の記録と失効カードの再入室記録で怪談を書いて。失効カードが入室。",
    "博物館の展示ケースの密閉度と内部湿度と温度勾配と酸化指標とガス濃度と酸素濃度の測定で怪談を書いて。測定していないのにデータ。",
    "カフェのミルクの温度と泡立て時間と泡の細かさと泡の持続時間とラテアートの成功率と失敗の理由とクリーナーの交換記録で怪談を書いて。失敗していないのに失敗記録。",
    "自動販売品の飲料の温度と設定温度と設定温度との差と設定変更履歴と霜取り運転の記録と霜取りの頻度と霜取りの時間と霜取り後の温度回復時間で怪談を書いて。霜取りしていないのに記録。",
    "保育園の園児の食事の摂取量と残食量とアレルギー反応と嘔吐の記録と下痢の記録と発熱の記録と医師の診察記録と服薬の記録と副作用の記録と体調の変化と体重の増減と食欲の変化と睡眠の変化と排泄の変化と尿の色と便の色と便の硬さと便の頻度と尿の頻度と尿の色と尿の匂いと尿の泡で怪談を書いて。変化していないのに記録がある。",
    "カレンダーの予定の重複と衝突とキャンセルと再スケジュールとメモと備考と参加者の変更と参加者の返信と参加者の欠席と参加者の遅刻と参加者の早退と参加者の場所の変更と参加者の連絡先の更新と参加者の連絡不能と参加者の不在と参加者の病気と参加者の事故と参加者の死亡で怪談を書いて。参加していないのに参加記録。",
    "図書館の書籍の破損と汚れと折り目と書き込みと欠頁と検出と修理と修理の費用と修理の期間と修理の結果と修理前の状態の写真と修理後の状態の写真と修理前の状態の測定データと修理後の状態の測定データと修理前の状態の記録と修理後の状態の記録で怪談を書いて。破損していないのに修理記録。",
    "音楽教室の生徒の練習時間と練習曲と練習の進度と先生の指導時間と指導内容と指導の記録と評価と評価の理由と評価の基準と評価の比較と上位者との差と下位者との差と平均との差と標準偏差と分散と中央値と最頻値と最大値と最小値と範囲と四分位で怪談を書いて。指導していないのに記録がある。",
    "クリーニングの衣類の匂いの原因と匂いの強さと匂いの種類と匂いの持続時間と洗濯回数と洗濯の水温と洗濯の時間と洗濯の洗剤の種類と洗濯の洗剤の量と洗濯の乾燥の時間と乾燥の温度と乾燥の方法と乾燥の結果とアイロンの温度とアイロンの時間とアイロンの結果とスチームの量とスチームの時間とスチームの結果と香料の種類と香料の量と香料の持続時間で怪談を書いて。匂っていないのに匂い記録。",
    "ペットの餌の残り量と餌の量と餌の回数と餌の時間と餌の場所と餌の器と餌の温度と餌の匂いと餌の色と餌の硬さと餌の柔らかさと餌の水分量と餌の脂質量と餌のタンパク質量と餌の炭水化物量と餌の食物繊維量と餌のミネラル量と餌のビタミン量と餌のカロリーと餌の価格と餌のブランドと餌の製造元と餌の賞味期限と餌の保存方法で怪談を書いて。食べていないのに残り記録。",
    "温泉の露天風呂の水温と室内風呂の水温と水圧と水流の強さと水流の方向と水流の種類と水風呂の水温と水風呂の時間と水風呂の結果とサウナの温度とサウナの時間とサウナの種類とサウナの結果と冷水の温度と冷水の時間と冷水の結果と蒸気の温度と蒸気の量と蒸気の方向と蒸気の結果と入浴者の数と入浴者の年齢と入浴者の性別と入浴者の体調で怪談を読んで。入浴していないのに記録。",
    "花屋の開花促進剤の散布量と散布頻度と散布時期と散布の時期と散布の季節と散布の月と散布の日と散布の時間と散布の時間帯と散布の天気と散布の気温と散布の湿度と散布の風速と散布の風向きと散布の土壌の種類と散布の土壌のpHと散布の土壌の水分量と散布の土壌の温度と散布の土壌の養分濃度と散布の土壌の微生物量で怪談を書いて。散布していないのに散布記録。",
    "図書館の館内の静粛時間と静粛時間外の騒音と騒音のレベルと騒音の種類と騒音の発生源と騒音の時間帯と騒音の頻度と騒音の持続時間と騒音の方向と騒音の音程と騒音の音量と騒音の音色と騒音のリズムと騒音のメロディと騒音のハーモニーと騒音の和音と騒音のコードと騒音の進行と騒音の展開と騒音の結末で怪談を書いて。静粛ではないのに記録。",
    "カメラの画像のノイズとノイズの量とノイズの種類とノイズの場所とノイズの色とノイズの形状とノイズの大きさとノイズの頻度とノイズの持続時間とノイズの方向とノイズの速度とノイズの加速度とノイズの振幅とノイズの周波数とノイズの位相とノイズの波形とノイズのスペクトルとノイズのエネルギーとノイズの力とノイズの圧力とノイズの温度で怪談を書いて。ノイズではないのに記録。",
    "病院の患者の痛みと痛みの強さと痛みの種類と痛みの場所と痛みの時期と痛みの頻度と痛みの持続時間と痛みの方向と痛みの性質と痛みの感覚と痛みの程度と痛みの範囲と痛みの深さと痛みの広さで怪談を書いて。痛くないのに痛み記録。",
    "映画館の映画の上映時間と上映時間の変更と上映時間の変更理由と上映時間の延長と上映時間の短縮と上映時間の停止と上映時間の再開と上映時間の再開理由と上映時間の再開時期と上映時間の変更履歴と上映時間の変更記録と上映時間の変更通知と上映時間の変更告知と上映時間の変更案内で怪談を書いて。変更していないのに変更記録。",
    "植物の成長の速度と成長の方向と成長の方向の変化と成長の方向の変化の理由と成長の方向の変化の時期と成長の方向の変化の頻度と成長の方向の変化の持続時間と成長の方向の変化の大きさで怪談を書いて。成長していないのに成長記録。",
    "スマートウォッチの通知の受信時間と受信の頻度と受信の持続時間と受信の大きさで怪談を書いて。受信していないのに受信記録。",
    "郵便物の消印と差出地の謎で怪談を書いて。",
]

# 自己改善用のファイル
IMPROVEMENT_LOG = "improvement_log.json"
PROMPT_FILE = "system_prompt.md"

def load_improvement_log():
    """改善履歴を読み込む"""
    if os.path.exists(IMPROVEMENT_LOG):
        try:
            with open(IMPROVEMENT_LOG, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return {"improvements": [], "system_prompt_history": []}
    return {"improvements": [], "system_prompt_history": []}

def save_improvement_log(log):
    """改善履歴を保存する"""
    with open(IMPROVEMENT_LOG, "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)

def load_system_prompt():
    """system_prompt.md からシステムプロンプトをロード"""
    if os.path.exists(PROMPT_FILE):
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    return ""

def save_system_prompt(prompt):
    """システムプロンプトを system_prompt.md に保存"""
    with open(PROMPT_FILE, "w", encoding="utf-8") as f:
        f.write(prompt + "\n")

def analyze_story_for_scary(story_content):
    """怪談の怖さを分析し、改善点を抽出する"""
    target_model = get_current_model()
    analysis_prompt = (
        "以下の怪談の本文を評価し、以下のJSON形式で出力してください。\n"
        "評価項目:\n"
        "- 恐怖の強さ (1-10): 全体的な怖さ\n"
        "- 新鮮さ (1-10): パターン化されていない度合い\n"
        "- 没入感 (1-10): 読者を物語に引き込める度合い\n"
        "- 残響力 (1-10): 読んだ後に残る不気味さ\n"
        "- 平均点 (浮動小数点): 上記4項目の平均\n"
        "- 良かった点: 恐怖効果が高かった要素を2-3個挙げよ\n"
        "- 改善点: さらに怖くするための具体的な改善点を2-3個挙げよ\n"
        "- 改善提案: SYSTEM_PROMPTに追加すべき具体的な指示を1つ挙げよ\n"
        "必ずJSON形式で出力。余計な解説は不要。\n"
        "JSON形式: {\"fear_score\": 7.5, \"novelty_score\": 6.0, \"immersion_score\": 8.0, \"aftertaste_score\": 7.0, \"avg_score\": 7.13, \"strengths\": [\"点A\", \"点B\"], \"improvements\": [\"点C\", \"点D\"], \"prompt_addition\": \"追加する指示\"}\n\n---\n\n"
        + story_content[:4000]
    )
    payload = {
        "model": target_model,
        "messages": [
            {"role": "system", "content": "あなたは怪談の専門家です。怪談の怖さを多角的に評価できます。"},
            {"role": "user", "content": analysis_prompt}
        ]
    }
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(API_URL, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if "choices" in res_data:
                result_text = res_data["choices"][0]["message"]["content"]
            elif "content" in res_data:
                result_text = res_data["content"]
            else:
                return None
            json_start = result_text.find("{")
            json_end = result_text.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                return json.loads(result_text[json_start:json_end])
            return None
    except:
        return None

def improve_system_prompt(story_content, analysis, current_prompt):
    """分析結果に基づいてSYSTEM_PROMPTを改善し、system_prompt.md に保存する"""
    if analysis is None:
        return current_prompt

    avg_score = analysis.get("avg_score", 5.0)
    prompt_addition = analysis.get("prompt_addition", "")

    log = load_improvement_log()
    log["improvements"].append({
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "avg_score": avg_score,
        "strengths": analysis.get("strengths", []),
        "improvements": analysis.get("improvements", []),
        "prompt_addition": prompt_addition,
        "current_prompt": current_prompt
    })
    if len(log["improvements"]) > 10:
        log["improvements"] = log["improvements"][-10:]

    log["system_prompt_history"].append({
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "prompt": current_prompt,
        "score": avg_score
    })
    if len(log["system_prompt_history"]) > 20:
        log["system_prompt_history"] = log["system_prompt_history"][-20:]

    new_prompt = current_prompt
    if prompt_addition and prompt_addition not in current_prompt:
        new_prompt = current_prompt + " また、" + prompt_addition
        log["system_prompt_history"].append({
            "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "prompt": new_prompt,
            "score": avg_score,
            "improved": True
        })

    if avg_score < 6.0:
        extra = " 恐怖表現が抽象的になりすぎていないか確認すること。具体的な五感に訴える描写を重視すること。"
        if extra not in new_prompt:
            new_prompt = new_prompt + extra
            log["system_prompt_history"].append({
                "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "prompt": new_prompt,
                "score": avg_score,
                "improved": True,
                "reason": "low_score"
            })

    save_system_prompt(new_prompt)
    save_improvement_log(log)
    return new_prompt

# スクリプト起動時に system_prompt.md からロード
SYSTEM_PROMPT = load_system_prompt()
if not SYSTEM_PROMPT:
    SYSTEM_PROMPT = ("あなたは怪談系YouTuberです。視聴者から送られてきた様々なジャンルの"
                     "投稿怪談を読み上げるスタイルで文章を書いてください。テーマは様々。"
                     "怖ければなんでもいいです。日常生活で起きた不可解なできごと、心霊現象、"
                     "都市伝説、学校の怪談、職場の怪談、家族の怪談などジャンルは問いません。"
                     "話の内容は怖ければ怖いほど良いですが、あまりに過激な内容は避けてください。"
                     "口語的でわかりやすい表現を心がけてください。なるべく長い文章を書いて。")

# 日付（月と日）からテーマを決定
from datetime import datetime
now = datetime.now()
index = (now.month * 32 + now.day) % len(THEMES)
INPUT_TEXT = THEMES[index]

def get_current_model():
    """現在ロードされているモデルを取得する"""
    try:
        req = urllib.request.Request(f"{API_BASE_URL}/models")
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if "data" in res_data and len(res_data["data"]) > 0:
                # 最初のモデルを返す
                return res_data["data"][0]["id"]
    except Exception as e:
        print(f"Error fetching models: {e}")
    return "google/gemma-4-26b-a4b" # デフォルト

def generate_story():
    model = get_current_model()
    print(f"Using model for story: {model}")

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": INPUT_TEXT}
        ]
    }

    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(API_URL, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if "choices" in res_data:
                return res_data["choices"][0]["message"]["content"], model
            elif "output" in res_data and isinstance(res_data["output"], list) and len(res_data["output"]) > 0:
                return res_data["output"][0]["content"], model
            elif "content" in res_data:
                return res_data["content"], model
            elif "response" in res_data:
                return res_data["response"], model
            else:
                return str(res_data), model
    except urllib.error.URLError as e:
        print(f"Error connecting to API: {e}")
        sys.exit(1)

def get_title_from_story(story_content):
    """本文からタイトルを生成する"""
    target_model = get_current_model()
    print(f"Generating title using {target_model}...")
    payload = {
        "model": target_model,
        "messages": [
            {"role": "system", "content": "与えられた怪談の本文を読み、その話にふさわしい、読者の興味を引く短いタイトルを一つだけ考えて出力してください。余計な解説や装飾は不要です。"},
            {"role": "user", "content": story_content}
        ]
    }

    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(API_URL, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if "choices" in res_data:
                title = res_data["choices"][0]["message"]["content"]
            elif "content" in res_data:
                title = res_data["content"]
            else:
                title = "無題の怪談"

            # クリーニング（改行や引用符の除去）
            title = title.strip().replace("\n", "").replace('"', '').replace('「', '').replace('」', '')
            return title
    except:
        return "無題の怪談"

def clean_content(content):
    # <think>...</think> タグとその内容を削除
    content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)

    # 文頭の全角スペースを削除
    content = content.replace("　", "")

    # 画像の後の改行を2つにする（ガイドライン準拠）
    content = re.sub(r'(!\[.*?\]\(.*?\))\n(?!\n)', r'\1\n\n', content)

    return content.strip()

def get_slug(title):
    # タイトルから英単語のスラッグを生成するために再度APIを呼び出す
    # スラッグ生成は精度の高い特定のモデルで実行する
    target_model = get_current_model()
    payload = {
        "model": target_model,
        "messages": [
            {"role": "system", "content": "与えられた日本語のタイトルを元に、Jekyllのファイル名に使用する英語のスラッグ（小文字、英単語をハイフンで繋いだもの）のみを出力してください。余計な解説は不要です。例：七分早い時計 -> seven-minute-watch"},
            {"role": "user", "content": title}
        ]
    }

    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(API_URL, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if "choices" in res_data:
                slug = res_data["choices"][0]["message"]["content"]
            elif "output" in res_data and isinstance(res_data["output"], list) and len(res_data["output"]) > 0:
                slug = res_data["output"][0]["content"]
            elif "content" in res_data:
                slug = res_data["content"]
            elif "response" in res_data:
                slug = res_data["response"]
            else:
                slug = "school-horror"

            # クリーニング（英数字とハイフン以外を除去）
            slug = slug.lower().strip()
            slug = re.sub(r'[^a-z0-9\-]', ' ', slug).strip().replace(' ', '-')
            slug = re.sub(r'-+', '-', slug)
            return slug
    except:
        return "school-horror-" + datetime.now().strftime("%H%M%S")

def parse_and_save(content, model):
    # 本文からタイトルを生成する
    title = get_title_from_story(content)
    print(f"Generated title: {title}")

    body = content.strip()

    # 今日の日付
    today = datetime.now().strftime("%Y-%m-%d")

    print(f"Generating slug for title: {title}...")
    slug = get_slug(title)

    filename = f"{today}-{slug}.md"
    filepath = os.path.join("_posts", filename)

    # クレジット
    credit = f"\n\n---\nWritten by {model}"

    # プロンプト情報の追記
    prompt_info = f"""

system prompt:
```
{SYSTEM_PROMPT}
```

user prompt:
```
{INPUT_TEXT}
```
"""

    # フロントマターと本文の組み立て
    post_data = f"""---
title: {title}
---

{body}{credit}{prompt_info}
"""

    # _posts ディレクトリの確認
    if not os.path.exists("_posts"):
        os.makedirs("_posts")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(post_data)

    return filepath

if __name__ == "__main__":
    print("Generating story...")
    raw_content, story_model = generate_story()

    # 最初に <think> タグなどを除去してクリーンにする
    cleaned = clean_content(raw_content)

    # 分析と改善
    print("Analyzing story for improvements...")
    analysis = analyze_story_for_scary(cleaned)
    if analysis:
        print(f"Analysis score: {analysis.get('avg_score')} / 10")
        new_prompt = improve_system_prompt(cleaned, analysis, SYSTEM_PROMPT)
        if new_prompt != SYSTEM_PROMPT:
            print("System prompt improved and saved.")
    else:
        print("Analysis failed, skipping improvement.")

    path = parse_and_save(cleaned, story_model)
    print(f"Success! Saved to {path}")

