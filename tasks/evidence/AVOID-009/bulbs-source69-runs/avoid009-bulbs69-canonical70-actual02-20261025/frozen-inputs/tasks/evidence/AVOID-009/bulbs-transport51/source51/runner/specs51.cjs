'use strict';
const specs=[
{id:'manual-source-area',control:'manual',W:960,H:540,text:'風の先へ',seed:1205,params:{font:'dela',shape:'board',chase:'chase',dir:1,sub:false}},
{id:'locked-source',control:'lock',W:960,H:540,text:'風の先へ',seed:1205,params:{font:'dela',shape:'board',chase:'chase',dir:1,sub:false}},
{id:'emphasis-source',control:'emphasis',W:960,H:540,text:'風の先へ',seed:1205,params:{font:'dela',shape:'board',chase:'chase',dir:1,sub:false}},
{id:'ghost-disabled-native',ghost:false,W:960,H:540,text:'風の先へ',seed:1205,params:{font:'dela',shape:'double',chase:'wave',dir:1,sub:true}},
{id:'one-board',W:960,H:540,text:'風',seed:1205,params:{font:'dela',shape:'board',chase:'chase',dir:1,sub:false}},
{id:'four-arrow-right',W:960,H:540,text:'風の先へ',seed:1205,params:{font:'dela',shape:'arrow',chase:'alt',dir:1,sub:true}},
{id:'latin-arrow-left',W:960,H:540,text:'HELLO WORLD?',seed:704,lineText:'A DIFFERENT CAPTION',params:{font:'dela',shape:'arrow',chase:'wave',dir:-1,sub:true}},
{id:'portrait-arrow-fallsback',W:540,H:960,text:'あしたのそらへ',seed:704,params:{font:'dela',shape:'arrow',chase:'chase',dir:-1,sub:true}},
{id:'square-double-No-caption',W:600,H:600,text:'HELLO',seed:704,params:{font:'dela',shape:'double',chase:'alt',dir:-1,sub:true}},
{id:'long-JP-capped-ring',W:1800,H:540,text:'風の先へ晴れの空へ明日の街へ遠い光の向こうまで歌を届けよう',seed:1205,params:{font:'dela',shape:'double',chase:'wave',dir:1,sub:false}},
{id:'long-Latin-word',W:960,H:540,text:'SUPERCALIFRAGILISTICEXPIALIDOCIOUS',seed:704,lineText:'あ'.repeat(28),params:{font:'dela',shape:'board',chase:'chase',dir:1,sub:true}},
{id:'caption29-UTF16',W:960,H:540,text:'風の先へ',seed:1205,lineText:'あ'.repeat(26)+'😀x',params:{font:'dela',shape:'double',chase:'alt',dir:1,sub:true}},
{id:'port-threshold-below',W:500,H:539.9999999,text:'風の先へ',seed:1205,params:{font:'dela',shape:'arrow',chase:'wave',dir:-1,sub:false}},
{id:'port-threshold-equal',W:500,H:540,text:'風の先へ',seed:1205,outDur:0,params:{font:'dela',shape:'arrow',chase:'wave',dir:-1,sub:false}},
{id:'port-threshold-above-short',W:500,H:540.0000001,text:'風の先へ',seed:1205,shortDur:.45,params:{font:'dela',shape:'arrow',chase:'wave',dir:-1,sub:false}}
];

module.exports=specs;
