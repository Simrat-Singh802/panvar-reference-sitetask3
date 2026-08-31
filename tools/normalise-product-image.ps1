# Normalises MSP product shots to a consistent studio presentation.
#
# It does NOT retouch, recolour or alter any garment. It only:
#   1. detects the garment's bounding box against the white background
#   2. rescales so every garment occupies the same target height fraction
#   3. re-centres it on a uniform pure-white square canvas
#
# Result: identical framing, background and aspect ratio across the set,
# with each product still its own genuine photograph.

Add-Type -AssemblyName System.Drawing

$src = Join-Path (Split-Path $PSScriptRoot -Parent) "assets\img\msp"
$out = Join-Path (Split-Path $PSScriptRoot -Parent) "assets\img\_normalised"
New-Item -ItemType Directory -Path $out -Force | Out-Null

$CANVAS = 800          # final square size (up from 500 - better on high-DPI)
$TARGET = 0.82         # garment's longest side as a fraction of the canvas

foreach ($f in (Get-ChildItem "$src\*.jpg" | Sort-Object Name)) {
  $bmp = New-Object System.Drawing.Bitmap($f.FullName)
  $w = $bmp.Width; $h = $bmp.Height

  # --- background tone from the four corners ---
  $w12 = $w - 14; $h12 = $h - 14
  $corners = @( @(0,0), @($w12,0), @(0,$h12), @($w12,$h12) )
  $rs=0;$gs=0;$bs=0;$n=0
  foreach ($c in $corners) {
    for ($x=$c[0]; $x -lt $c[0]+14; $x++) {
      for ($y=$c[1]; $y -lt $c[1]+14; $y++) {
        $p=$bmp.GetPixel($x,$y); $rs+=$p.R; $gs+=$p.G; $bs+=$p.B; $n++
      }
    }
  }
  $br=[int]($rs/$n); $bg=[int]($gs/$n); $bb=[int]($bs/$n)

  # --- garment bounding box (threshold tuned to ignore JPEG noise/soft shadow) ---
  $minX=$w;$maxX=0;$minY=$h;$maxY=0
  for ($y=0; $y -lt $h; $y++) {
    for ($x=0; $x -lt $w; $x++) {
      $p=$bmp.GetPixel($x,$y)
      $diff=[math]::Abs($p.R-$br)+[math]::Abs($p.G-$bg)+[math]::Abs($p.B-$bb)
      if ($diff -gt 60) {
        if($x -lt $minX){$minX=$x}; if($x -gt $maxX){$maxX=$x}
        if($y -lt $minY){$minY=$y}; if($y -gt $maxY){$maxY=$y}
      }
    }
  }

  $gw = $maxX - $minX + 1
  $gh = $maxY - $minY + 1
  if ($gw -le 0 -or $gh -le 0) { "SKIP $($f.Name) - no garment found"; $bmp.Dispose(); continue }

  # --- scale so the longest garment side hits TARGET of the canvas ---
  $longest = [Math]::Max($gw, $gh)
  $scale = ($CANVAS * $TARGET) / $longest
  $newW = [int][Math]::Round($gw * $scale)
  $newH = [int][Math]::Round($gh * $scale)
  $offX = [int][Math]::Round(($CANVAS - $newW) / 2)
  $offY = [int][Math]::Round(($CANVAS - $newH) / 2)

  # --- compose onto a pure white square ---
  $cv = New-Object System.Drawing.Bitmap($CANVAS, $CANVAS)
  $g = [System.Drawing.Graphics]::FromImage($cv)
  $g.Clear([System.Drawing.Color]::White)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  $destRect = New-Object System.Drawing.Rectangle($offX, $offY, $newW, $newH)
  $srcRect  = New-Object System.Drawing.Rectangle($minX, $minY, $gw, $gh)
  $g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()

  # --- save at high JPEG quality ---
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
           Where-Object { $_.MimeType -eq 'image/jpeg' }
  $eps = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $eps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
      [System.Drawing.Imaging.Encoder]::Quality, 92)
  $cv.Save("$out\$($f.Name)", $codec, $eps)

  "{0,-22} garment {1}x{2} -> {3}x{4}  scale {5}" -f `
     $f.Name, $gw, $gh, $newW, $newH, [math]::Round($scale,2)

  $cv.Dispose(); $bmp.Dispose()
}

"`nwritten to $out"


