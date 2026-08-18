---
layout: post
title: "浴室の鏡の映り込みに、0.5秒の遅延があった"
date:   2026-10-29 03:00:00 +0900
categories: jekyll update horror
---

実家の父母が住む古びたアパートに、一人暮らしを始めて三ヶ月目になった。築四十五年という物件は家賃が安く、その分古い設備と狭い間取りがトレードオフだった。

浴室は広くない。縦60cm、横90cmほどのタイルの壁に、一枚の大きな鏡が貼ってある。入居当初から、この鏡に少し違和感があった。鏡に映る自分の動きが、いつもほんの少し遅れているような気がするのだ。

「疲れすぎてるのかな」

そう思っていた。残業続きで、脳が視覚情報を処理するタイミングがずれているだけだと。

しかし、その違和感は消えなかった。毎晩鏡を見るたび、何かが引っかかる。

ある深夜、ふと鏡の前で手を上げてみた。右手を上げる。鏡の中の自分も右手を上げる。しかし、実際の右手が上がり終わった後、鏡の中の手の動きがまだ続いている。

遅延。

正確には測れなかったが、おそらく0.5秒前後の遅れがあった。

「鏡が古いから、反射の仕方が違うのか」

そう自分に言い聞かせて、その日は就寝した。

次の日、鏡の前に立ち、スマートフォンで自分の顔を録画した。画面と鏡を交互に見比べながら、動きをテストした。

結果は明白だった。鏡に映る自分の動きは、実際の動きより約0.5秒遅れていた。

鏡が古いから、反射の仕方が違うから。

そんな理由で片付けられるはずがない。鏡はただのガラスと銀の膜だ。光の反射に遅延など生じ得ない。

それ以来、毎晩鏡の前でテストを繰り返した。毎日同じ結果。0.5秒の遅延。

そして、一週間前のある夜、テストをしながらふと気づいたのだ。

鏡の中の自分が、今まさにしている動きの0.5秒後に、ほんの少しだけ、違う表情をしていることに。

手を上げた後、鏡の中の自分は、手を上げ終わった後で、じっとこちらを見つめていた。

微笑んでいた。

僕は手を上げていない。

その日以来、鏡を見るのが怖い。

しかし、毎晩洗顔をしないといけない。鏡を見ずに歯を磨くこともできる。生活に支障はない。

ただ、鏡の中身が、ほんの少しだけ、僕より先に動いているのか、僕より0.5秒遅れて動いているのか、もうわからない。

ある夜、鏡の前に立ち、ゆっくりと手を上げた。

鏡の中の自分も手を上げた。

手を下げた。

鏡の中の自分も手を下げた。

そして、鏡の中の自分が、手を下げ終わった後、もう一度、ゆっくりと手を上げた。

僕は手を上げていない。

鏡の中の自分は、手を上げながら、じっとこちらを見つめていた。

その時、浴室の電気が一瞬、点滅した。

明かりが戻ったとき、鏡の中の自分は、手を下ろしていた。

そして、笑っていた。

僕は、今も鏡を見ない。

浴室に入るたび、シャワーの音で耳が塞がれるのを待っている。

鏡が見えないように。

映り込みが、僕より先に動いているのを見ないように。

---

<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <rect width="800" height="450" fill="#0a0808"/>
  
  <!-- Bathroom wall tiles -->
  <rect x="0" y="0" width="800" height="450" fill="#0a0808"/>
  <g stroke="#1a1515" stroke-width="0.5" opacity="0.3">
    <line x1="0" y1="75" x2="800" y2="75"/>
    <line x1="0" y1="150" x2="800" y2="150"/>
    <line x1="0" y1="225" x2="800" y2="225"/>
    <line x1="0" y1="300" x2="800" y2="300"/>
    <line x1="0" y1="375" x2="800" y2="375"/>
    <line x1="160" y1="0" x2="160" y2="450"/>
    <line x1="320" y1="0" x2="320" y2="450"/>
    <line x1="480" y1="0" x2="480" y2="450"/>
    <line x1="640" y1="0" x2="640" y2="450"/>
  </g>
  
  <!-- Mirror frame -->
  <rect x="250" y="30" width="300" height="380" rx="4" fill="none" stroke="#1a1a1a" stroke-width="6"/>
  <rect x="253" y="33" width="294" height="374" rx="2" fill="#0d0b0b"/>
  
  <!-- Mirror surface glow -->
  <rect x="253" y="33" width="294" height="374" rx="2" fill="#121010" opacity="0.5"/>
  
  <!-- Person silhouette (facing mirror, outside) -->
  <g fill="#050505" opacity="0.9">
    <!-- Head -->
    <ellipse cx="550" cy="140" rx="22" ry="28"/>
    <!-- Body -->
    <path d="M530,170 Q520,220 515,300 L585,300 Q580,220 570,170 Z"/>
    <!-- Left arm -->
    <path d="M525,180 Q500,210 490,250 L495,255 Q505,215 530,185 Z"/>
  </g>
  
  <!-- Reflection in mirror (slightly offset, with hand raised) -->
  <g fill="#1a1515" opacity="0.6">
    <!-- Head (slightly offset) -->
    <ellipse cx="400" cy="145" rx="22" ry="28"/>
    <!-- Body -->
    <path d="M380,175 Q370,225 365,305 L435,305 Q430,225 420,175 Z"/>
    <!-- Left arm (normal) -->
    <path d="M375,185 Q350,215 340,255 L345,260 Q355,220 380,190 Z"/>
    <!-- Right arm (RAISED - the horror element) -->
    <path d="M425,185 Q450,160 460,120 L452,118 Q442,158 418,182 Z"/>
  </g>
  
  <!-- Eyes in the reflection (subtle, creepy) -->
  <g fill="#2a2020" opacity="0.8">
    <ellipse cx="393" cy="140" rx="3" ry="2"/>
    <ellipse cx="407" cy="140" rx="3" ry="2"/>
  </g>
  
  <!-- Subtle smile in reflection -->
  <path d="M392,152 Q400,158 408,152" stroke="#2a2020" stroke-width="1.5" fill="none" opacity="0.7"/>
  
  <!-- Dim overhead light -->
  <circle cx="400" cy="15" r="8" fill="#1a1510" opacity="0.4"/>
  <ellipse cx="400" cy="23" rx="20" ry="5" fill="#1a1510" opacity="0.2"/>
  
  <!-- Light rays (very subtle) -->
  <line x1="400" y1="23" x2="350" y2="200" stroke="#1a1510" stroke-width="0.5" opacity="0.15"/>
  <line x1="400" y1="23" x2="450" y2="200" stroke="#1a1510" stroke-width="0.5" opacity="0.15"/>
  
  <!-- Floor -->
  <rect x="0" y="410" width="800" height="40" fill="#080606"/>
  
  <!-- Subtle vignette -->
  <rect x="0" y="0" width="800" height="450" fill="url(#vignette)" opacity="0.3"/>
  
  <defs>
    <radialGradient id="vignette" cx="50%" cy="50%" r="60%">
      <stop offset="40%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="1"/>
    </radialGradient>
  </defs>
</svg>
