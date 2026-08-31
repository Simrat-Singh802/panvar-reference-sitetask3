# WCAG 2.1 relative-luminance contrast check.
function Get-Lum([string]$hex) {
  $hex = $hex.TrimStart('#')
  $ch = @()
  foreach ($i in 0,2,4) {
    $v = [Convert]::ToInt32($hex.Substring($i,2),16) / 255.0
    if ($v -le 0.03928) { $ch += $v / 12.92 } else { $ch += [Math]::Pow(($v + 0.055)/1.055, 2.4) }
  }
  return 0.2126*$ch[0] + 0.7152*$ch[1] + 0.0722*$ch[2]
}
function Get-Ratio($a,$b) {
  $la = Get-Lum $a; $lb = Get-Lum $b
  $hi = [Math]::Max($la,$lb); $lo = [Math]::Min($la,$lb)
  return [Math]::Round(($hi + 0.05) / ($lo + 0.05), 2)
}

$white = '#ffffff'
$tests = @(
  @{n='body text on white';        fg='#16191e'; bg=$white; min=4.5},
  @{n='muted text on white';       fg='#5b616c'; bg=$white; min=4.5},
  @{n='muted on surface-alt';      fg='#5b616c'; bg='#f7f8fa'; min=4.5},
  @{n='house accent on white';     fg='#1f3a5f'; bg=$white; min=4.5},
  @{n='white on house accent';     fg=$white;    bg='#1f3a5f'; min=4.5},
  @{n='ZONIXA accent on white';    fg='#3b1f38'; bg=$white; min=4.5},
  @{n='white on ZONIXA accent';    fg=$white;    bg='#3b1f38'; min=4.5},
  @{n='ZONIXA accent on its soft'; fg='#3b1f38'; bg='#f6eef5'; min=4.5},
  @{n='MSP accent on white';       fg='#0b5cad'; bg=$white; min=4.5},
  @{n='white on MSP accent';       fg=$white;    bg='#0b5cad'; min=4.5},
  @{n='MSP accent on its soft';    fg='#0b5cad'; bg='#e7f1fb'; min=4.5},
  @{n='danger on white';           fg='#a3231f'; bg=$white; min=4.5},
  @{n='danger on danger-soft';     fg='#a3231f'; bg='#fdeceb'; min=4.5},
  @{n='WhatsApp btn text';         fg=$white;    bg='#1c7a4a'; min=4.5},
  @{n='dark-section body text';    fg='#b9bec7'; bg='#0d0f12'; min=4.5},
  @{n='white on dark surface';     fg=$white;    bg='#0d0f12'; min=4.5},
  @{n='TODO badge text';           fg='#7a4e00'; bg='#fff4e0'; min=4.5},
  @{n='callout text';              fg='#6b4400'; bg='#fffaf0'; min=4.5},
  @{n='border ink-400 on white (UI 3:1)'; fg='#868c97'; bg=$white; min=3.0},
  @{n='line-strong on white (UI 3:1)';    fg='#767c86'; bg=$white; min=3.0}
)

$fails = 0
foreach ($t in $tests) {
  $r = Get-Ratio $t.fg $t.bg
  $pass = $r -ge $t.min
  if (-not $pass) { $fails++ }
  $mark = if ($pass) { 'PASS' } else { 'FAIL' }
  "{0}  {1,5}:1  (min {2})  {3}" -f $mark, $r, $t.min, $t.n
}
""
"failures: $fails"

