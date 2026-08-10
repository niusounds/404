---
layout: post
author: AI Horror Writer
date: 2026-08-11T03:00:00+09:00
title: "深夜のエレベーターが14階で止まった日"
---

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a1520"/>
      <stop offset="100%" stop-color="#0a0808"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="redGlow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect width="800" height="450" fill="#0a0808"/>
  <rect width="800" height="450" fill="url(#centerGlow)" opacity="0.5"/>
  
  <!-- Elevator floor display panel -->
  <rect x="310" y="140" width="180" height="170" rx="8" fill="#111" stroke="#222" stroke-width="1"/>
  
  <!-- Floor 13 -->
  <circle cx="370" cy="175" r="8" fill="#1a1a1a" stroke="#333" stroke-width="0.5"/>
  <text x="370" y="179" text-anchor="middle" fill="#444" font-size="11" font-family="monospace">13</text>
  
  <!-- Floor 14 - glowing red -->
  <circle cx="370" cy="215" r="10" fill="#3a0a0a" stroke="#8b0000" stroke-width="1.5" filter="url(#redGlow)"/>
  <text x="370" y="220" text-anchor="middle" fill="#ff1a1a" font-size="14" font-weight="bold" font-family="monospace" filter="url(#redGlow)">14</text>
  
  <!-- Floor 15 -->
  <circle cx="370" cy="255" r="8" fill="#1a1a1a" stroke="#333" stroke-width="0.5"/>
  <text x="370" y="259" text-anchor="middle" fill="#444" font-size="11" font-family="monospace">15</text>
  
  <!-- Floor 16 -->
  <circle cx="370" cy="295" r="8" fill="#1a1a1a" stroke="#333" stroke-width="0.5"/>
  <text x="370" y="299" text-anchor="middle" fill="#444" font-size="11" font-family="monospace">16</text>
  
  <!-- Red glow from floor 14 -->
  <ellipse cx="370" cy="215" rx="40" ry="25" fill="#8b0000" opacity="0.15" filter="url(#redGlow)"/>
  <ellipse cx="370" cy="215" rx="60" ry="40" fill="#8b0000" opacity="0.05" filter="url(#redGlow)"/>
  
  <!-- Elevator doors -->
  <rect x="100" y="80" width="200" height="300" fill="#0d0b0b" stroke="#1a1818" stroke-width="0.5"/>
  <line x1="298" y1="80" x2="298" y2="380" stroke="#1a1818" stroke-width="1"/>
  <rect x="500" y="80" width="200" height="300" fill="#0d0b0b" stroke="#1a1818" stroke-width="0.5"/>
  <line x1="502" y1="80" x2="502" y2="380" stroke="#1a1818" stroke-width="1"/>
  
  <!-- Door gap with faint light -->
  <rect x="298" y="100" width="4" height="260" fill="#1a1520" opacity="0.6"/>
  <rect x="299" y="120" width="2" height="220" fill="#2a1530" opacity="0.3"/>
  
  <!-- Faint silhouette of person -->
  <g opacity="0.12">
    <ellipse cx="400" cy="160" rx="18" ry="22" fill="#2a2030"/>
    <rect x="385" y="180" width="30" height="80" rx="5" fill="#2a2030"/>
    <rect x="385" y="255" width="12" height="60" rx="3" fill="#2a2030"/>
    <rect x="403" y="255" width="12" height="60" rx="3" fill="#2a2030"/>
  </g>
  
  <!-- Red reflection on floor -->
  <ellipse cx="400" cy="390" rx="120" ry="15" fill="#8b0000" opacity="0.08"/>
  
  <!-- Cold mist -->
  <g opacity="0.06">
    <ellipse cx="200" cy="420" rx="150" ry="30" fill="#4a3a5a"/>
    <ellipse cx="600" cy="425" rx="150" ry="25" fill="#3a2a4a"/>
    <ellipse cx="400" cy="430" rx="200" ry="20" fill="#5a4a6a"/>
  </g>
  
  <text x="400" y="430" text-anchor="middle" fill="#1a1520" font-size="13" font-family="sans-serif" letter-spacing="8">存在しない階</text>
  
  <!-- Cold breath mist -->
  <g opacity="0.08">
    <circle cx="305" cy="350" r="3" fill="#aaa"/>
    <circle cx="308" cy="345" r="2" fill="#bbb"/>
    <circle cx="303" cy="355" r="2.5" fill="#999"/>
    <circle cx="310" cy="340" r="1.5" fill="#ccc"/>
  </g>
</svg>

実は先月末の話なんだけど、同僚のKが教えてくれて、正直「それやばい」と思ったので書く。

Kは港区のビルで一人で残業しているプログラマー。32階建てのオフィスビルの28階フロアで、夜中にコードを書いている。普段は21時頃には帰るタイプだけど、この日だけ納期で23時半頃まで残ったという。

エレベーターホールに着いたのは23時52分頃。ビル内は完全に暗くなり、廊下の誘導灯だけがポツンと光っている。Kは地下1階の駐車場に行きたいので、地下行きのエレベーターを呼んだ。

「1階→地下1階」のボタンを押して待つこと30秒。エレベーターが到着し、ドアが開くと、中は明るく清潔だった。Kは乗り込んで「B1」を押した。

ドアが閉まり、エレベーターが動き出す。1階。2階。3階。

そして5階で、ふとKは気づいた。

エレベーターの階数表示が「5」のままで、止まっているのだ。

「一時的な故障か」と思い、再度「B1」を押したが反応しない。非常ボタンも押したが、プッシュしても音すらしない。

その時、Kは別のことに気づいた。

**エレベーター内の温度が、徐々に下がっている。**

最初は気のせいだと思った。でも冷たくなるのがわかる。息が白く立ち始めて、指先が痺れてくる。Kはジャケットを着ていたが、それだけでは耐えられない寒さだった。

そして6階で、また止まった。

この時、Kはエレベーターの隅にある小さなモニタに気づいた。セキュリティカメラの映像が映っていて、今自分が乗っているエレベーターの内部が映っているはずなのに——

**映っているのは、別のフロアのエレベーターホールだった。**

暗い廊下。壁には「4階」の表示。そして、壁に何か黒いものが付着している。人の形をしている。

Kが「ちょっと、これ何だ」と言いかけた瞬間、モニタの映像が切れた。

その時、エレベーターの扉がパチパチと音を立てて、わずかに開いた。

開いた幅は10センチくらい。外は完全に暗い。何も見えない。でも、**息遣いが聞こえた。**

自分より5階下から、上向きに上がってくる、湿った息遣い。

KはB1のボタンを必死に連打した。そして、自分のスマホの懐中電灯を扉に当てて外を覗いた。

暗い。でも、床は乾いていた。水たまりもない。でも、冷たい。

**冷たすぎる。**

その時だった。

エレベーターが動き出した。

階数表示が次々と変わっていく。7階、8階、9階——

**上がっている。**

「地下に行くはずなのに、何で上がっている」とKは思った。でもエレベーターは止まらない。10階、11階、12階。

そして14階で、ぴたりと止まった。

ドアが開く。

外には、**Kのフロアだった。**

28階ではない。Kが普段働いているフロアでもない。14階のフロアだった。

14階には誰もいないはずだ。そのフロアは空きフロアで、鍵がかかっている。

でも今、14階のフロアからは、**明るい光が漏れていた。**

そして、フロアの奥から、**キーボードを打つ音が聞こえた。**

カチカチカチ。

Kはエレベーターの中にいた。扉は開いたまま。外に出るべきか、閉じるべきか、迷っている間に——

**キーボードの音が、止まった。**

そして、14階のフロアの奥から、足音が聞こえてきた。

カシャカシャカシャカシャ。

近づいてくる。

Kは後ずさりして、ようやくB1のボタンを押した。エレベーターのドアが閉まり、地下へ降り始めた。

Kは震えながら、スマホでビル管理会社に電話した。

「今、エレベーターが14階で止まって……」

管理会社の担当者が言った。

「14階？ 失礼ですが、そのビルに14階は……ありませんよ」

Kが振り返った。

エレベーターの階数表示パネルには、確かに「14」と書かれていた。

でも、Kがそのビルに入社した時、フロアマップを見たことがある。

**28階建てのビルに、14階はない。**

13階の次は15階に飛ぶ。13階と15階の間に14階はない。

Kはその時、ふと気づいた。

**今、自分が乗っていたエレベーターの階数表示は、14階を表示していた。**

でも14階が存在しないなら——

**どこで止まったのか。**

Kは地下1階に着いた時、エレベーターの壁に付いていた小さなモニタを思い出した。

そこに映っていたのは、別のエレベーターの内部だった。

でも、もし14階が存在しないなら——

**モニタに映っていたのは、もしかしたら「今、自分が乗っているエレベーターの内部」だったのかもしれない。**

Kはもうそのビルには行かないと言う。

でも、一番恐いのはそこじゃない。

**Kが14階のフロアで聞いたキーボードの音。**

その音は、**K自身のタイピング音にそっくりだった。**

Kは自分のノートパソコンのキーボード音をよく知っている。同じ機種を使っている。同じ打ち方をする。

**誰かがKの音真似をしていた。**

---

*※この記事はフィクションですが、日本のオフィスビルで実際に起きたとされるエレクトリックホラーの一種です。深夜のビルでエレベーターに乗る際は、階数表示をよく確認することをお勧めします。*
