// Pixel-art tombstone avatars (16x16). Original art, one char per pixel, "." = transparent.
(() => {
  const PAL = { K:'#05070a', W:'#f5f0c8', S:'#e8fff0', G:'#39ff14', g:'#1f9d0e', P:'#b14bff', p:'#6a1fb0',
    O:'#ff8c1a', o:'#b85a00', R:'#ff2a3d', r:'#a01426', Y:'#ffe14a', B:'#2de2ff', b:'#1a8fb0', N:'#ff6fb5',
    E:'#8a90a0', D:'#7a4a21', T:'#d9c7a0', F:'#c9d98a' };
  const ART = {
    ghost: [
      '................','.....SSSSSS.....','...SSSSSSSSSS...','..SSSSSSSSSSSS..','..SSSSSSSSSSSS..','..SSKKSSSSKKSS..',
      '..SSKGSSSSKGSS..','..SSKKSSSSKKSS..','..SSSSSSSSSSSS..','..SSSSSKKSSSSS..','..SSSSSKKSSSSS..','..SSSSSSSSSSSS..',
      '..SSSSSSSSSSSS..','..SSSSSSSSSSSS..','..SS.SSSS.SSSS..','..S...SS...SS...'],
    ghost2: [
      '................','.B..........B...','.BB..BBBBBB..BB.','..BB.BBBBBB.BB..','...BBBBBBBBBB...','...BBBBBBBBBB...',
      '...BBKKBBKKBB...','...BBKKBBKKBB...','...BBBBBBBBBB...','...BBBBKKBBBB...','...BBBBKKBBBB...','....BBBBBBBB....',
      '....BBBBBBBB....','....BBBBBBBB....','....BB.BB.BB....','.....B..B..B....'],
    skull: [
      '................','....WWWWWWWW....','...WWWWWWWWWW...','..WWWWWWWWWWWW..','..WWWWWWWWWWWW..','..WWKKKWWKKKWW..',
      '..WWKKKWWKKKWW..','..WWKKRWWRKKWW..','..WWWWWWWWWWWW..','...WWWWKKWWWW...','....WWWKKWWW....','....WWWWWWWW....',
      '....WKWKWKWK....','....WKWKWKWK....','.....WWWWWW.....','................'],
    bat: [
      '................','................','.P..........P...','.PP...P..P..PP..','.PPP.PPPPPP.PPP.','.PPPPPPPPPPPPPP.',
      '.PPPPPKPPKPPPPP.','.PPPPPRPPRPPPPP.','.PP.PPPPPPPP.PP.','.P...PPWPPW..P..','......PPPPPP....','.......PPPP.....',
      '................','................','................','................'],
    pumpkin: [
      '................','.......GG.......','......GG........','....OOOGOOO.....','..OOOOOOOOOOOO..','.OOOOOOOOOOOOOO.',
      '.OOKKOOOOOKKOOO.','.OOKKKOOOKKKOOO.','.OOOOOOOOOOOOOO.','.OOKOOOOOOOKOOO.','.OOKKKKKKKKKOOO.','..OOKOKOKOKOOO..',
      '...OOOOOOOOOO...','....oooooooo....','................','................'],
    zombie: [
      '................','....gggggggg....','...gFFFFFFFFg...','..gFFFFFFFFFFg..','..gFFFFFFFFFFg..','..gFWKFFFFKKFg..',
      '..gFKKFFFFKKFg..','..gFFFFFFFFFFg..','..gFFKKKKKKFFg..','..gFFKRKRKRKFg..','...gFFFFFFFFg...','....gFFFFFFg....',
      '.....gFFFFg.....','..FF.gggggg.FF..','..FFFgggggggFF..','................'],
    spider: [
      '.......E........','.......E........','.......E........','.......E........','..K....KK....K..','...K..KKKK..K...',
      '....KKKKKKKK....','KKK.KKRKKRKK.KKK','...KKKKKKKKKK...','KKK.KKKKKKKK.KKK','..K..KKKKKK..K..','.K....K..K....K.',
      'K.............K.','................','................','................'],
    cat: [
      '................','..K..........K..','..KK........KK..','..KOK......KOK..','..KOOKKKKKKOOK..','..KOOOOOOOOOOK..',
      '..KOGKOOOOGKOK..','..KOGKOOOOGKOK..','..KOOOONNOOOOK..','..KOOOOKKOOOOK..','..K.OOKOOKOO.K..','...KOOOOOOOOK...',
      '....KKKKKKKK....','................','................','................'],
    mummy: [
      '................','....TTTTTTTT....','...TTTTTTTTTT...','..TTETTTTTTETT..','..TTTTTTTTTTTT..','..TEEEEEEEEEET..',
      '..TTKRTTTTRKTT..','..TTKKTTTTKKTT..','..EEEEEEEEEEEE..','..TTTTTTTTTTTT..','...TTETTTTETT...','...TTTTTTTTTT...',
      '....TEEEEEET....','....TTTTTTTT....','................','................'],
    vampire: [
      '................','....KKKKKKKK....','...KKKKKKKKKK...','..KKKKKKKKKKKK..','..KKKTTTTTTKKK..','..KKTTTTTTTTKK..',
      '..KTTRKTTKRTTK..','..KTTKKTTKKTTK..','..KTTTTTTTTTTK..','..KTTTTTTTTTTK..','..KTTRRRRRRTTK..','...KTWRRRRWTK...',
      '....KTTTTTTK....','..RR.KKKKKK.RR..','..RRRRRRRRRRRR..','................'],
    eyeball: [
      '................','.....SSSSSS.....','...SSSSSSSSSS...','..SSSRSSSSSRSS..','..SSSSRSSSSSSS..','.SSSSSSBBBBSSSS.',
      '.SSRSSBBKKBBSSS.','.SSSSSBBKKBBSRS.','.SSSSSSBBBBSSSS.','..SSSRSSSSSSSS..','..SSSSSSSRSSSS..','...SSSSSSSSSS...',
      '.....SSSSSS.....','................','................','................'],
    frank: [
      '................','..KKKKKKKKKKKK..','..KKKKKKKKKKKK..','..FFFFFFFFFFFF..','..FFFFFFFFFFFF..','..FFWKFFFFKWFF..',
      '..FFKKFFFFKKFF..','..FFFFFFFFFFFF..','..FFFFgFFgFFFF..','..FFFKKKKKKFFF..','..FFFFFFFFFFFF..','.EEFFFFFFFFFFEE.',
      '.EE.FFFFFFFF.EE.','................','................','................'],
    slime: [
      '................','................','................','.......GG.......','.....GGGGGG.....','....GGGGGGGG....',
      '...GGGGGGGGGG...','..GGGgGGGGgGGG..','..GGKKGGGGKKGG..','..GGKKGGGGKKGG..','.GGGGGGGGGGGGGG.','.GGGGGKKKKGGGGG.',
      '.GGGGGGGGGGGGGG.','..GgGGGGGGGGgG..','................','................'],
    witch: [
      '................','.......PP.......','......PPPP......','......PPPP......','.....PPPPPP.....','....PPPPPPPP....',
      '...PPPYYYYPPP...','..PPPPPPPPPPPP..','PPPPPPPPPPPPPPPP','...GGGGGGGGGG...','...GGKGGGGKGG...','...GGGGGGGGGG...',
      '...GGGGKKGGGG...','....GGGGGGGG....','................','................'],
    imp: [
      '................','.R..........R...','.RR........RR...','.RRR......RRR...','..RRRRRRRRRRR...','..RRRRRRRRRRRR..',
      '..RRYKRRRRKYRR..','..RRYKRRRRKYRR..','..RRRRRRRRRRRR..','..RRKRRRRRRKRR..','..RRRKKKKKKRRR..','...RRRRRRRRRR...',
      '....RRRRRRRR....','.....r....r.....','................','................'],
    crow: [
      '................','................','.....KKKK.......','....KKKKKK......','...KKKKKKKK.....','...KKYKKKKKK....',
      '...KKKKKKKKKKK..','OO.KKKKKKKKKKKK.','OOOKKKKKKKKKKKKK','...KKKKKKKKKKKK.','....KKKKKKKKKK..','.....KKKKKKK....',
      '......Y..Y......','................','................','................'],
    jelly: [
      '................','.....NNNNNN.....','...NNNNNNNNNN...','..NNNNNNNNNNNN..','.NNNNNNNNNNNNNN.','.NNNKNNNNNNKNNN.',
      '.NNNNNNNNNNNNNN.','.NNNNNNNNNNNNNN.','..NNNNNNNNNNNN..','..N.N.N..N.N.N..','..N.N.N..N.N.N..','..N..N.NN.N..N..',
      '.N...N.NN.N...N.','.N....N..N....N.','................','................']
  };
  const SPRITES = {}, NAMES = Object.keys(ART);
  NAMES.forEach(n => {
    const rows = ART[n]; let out = '';
    const byColor = {};
    rows.forEach((row, y) => {
      for (let x = 0; x < 16;) {
        const c = row[x] || '.';
        if (c === '.') { x++; continue; }
        let e = x; while (e < 16 && row[e] === c) e++;
        (byColor[c] = byColor[c] || []).push(`M${x} ${y}h${e - x}v1H${x}z`);
        x = e;
      }
    });
    Object.keys(byColor).forEach(c => { out += `<path fill="${PAL[c]}" d="${byColor[c].join('')}"/>`; });
    SPRITES[n] = out;
  });
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  // Assign a sprite to every app. Explicit valid "sprite" wins. Others get a deterministic pick from the slug hash,
  // skipping sprites already used by explicit entries / earlier tiles (until all are used), and never repeating
  // a recent neighbour or the next tile's explicit sprite.
  const assign = apps => {
    const out = new Array(apps.length), explicit = apps.map(a => (a.sprite && SPRITES[a.sprite]) ? a.sprite : null);
    const used = new Set(explicit.filter(Boolean)), N = NAMES.length, WIN = 5;
    apps.forEach((a, i) => {
      if (explicit[i]) { out[i] = explicit[i]; return; }
      const start = hash(String(a.slug || a.name)) % N, recent = out.slice(Math.max(0, i - WIN), i);
      const ok = (n, strict) => n !== explicit[i + 1] && (strict ? !used.has(n) : true) && !recent.includes(n);
      let pick = null;
      for (const strict of [true, false]) {
        for (let k = 0; k < N && !pick; k++) { const n = NAMES[(start + k) % N]; if (ok(n, strict)) pick = n; }
        if (pick) break;
      }
      out[i] = pick || NAMES[start]; used.add(out[i]);
    });
    return out;
  };
  window.TOMB = { SPRITES, NAMES, assign, svg: n => `<svg class="sprite" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges">${SPRITES[n] || SPRITES.ghost}</svg>` };
})();
