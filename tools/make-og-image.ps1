# Generates assets/img/og/og-default.jpg - the social sharing card used by the
# six non-product pages (home, both brand listings, about, contact, 404).
#
# 1200x630 is the size Facebook, WhatsApp and LinkedIn expect.
#
# Built only from assets already in this repo: the site's own ink-900 ground
# colour, the knit-stitch texture used behind the hero, and the company and
# brand names. Nothing here is invented.
#
# Uses System.Drawing rather than a Node image library because Node.js is not
# installed on this machine - see README.md "Why no framework".
#
# Re-run after changing the brand names or the palette:
#     powershell -File tools\make-og-image.ps1

Add-Type -AssemblyName System.Drawing

$root = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $root 'assets\img\og'
$outFile = Join-Path $outDir 'og-default.jpg'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$W = 1200
$H = 630

# Palette lifted from assets/css/01-tokens.css
$ink900 = [System.Drawing.ColorTranslator]::FromHtml('#0d0f12')
$white  = [System.Drawing.ColorTranslator]::FromHtml('#ffffff')
$muted  = [System.Drawing.ColorTranslator]::FromHtml('#b9bec7')   # --clr-ink-300
$accent = [System.Drawing.ColorTranslator]::FromHtml('#1f3a5f')   # --clr-accent

$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# --- ground -----------------------------------------------------------------
$g.Clear($ink900)

# --- soft accent wash on the right, echoing the hero's radial gradient ------
$washRect = New-Object System.Drawing.Rectangle(([int]($W * 0.42)), ([int](-$H * 0.35)), ([int]($W * 0.78)), ([int]($H * 1.7)))
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse($washRect)
$wash = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
$wash.CenterColor = [System.Drawing.Color]::FromArgb(150, $accent.R, $accent.G, $accent.B)
$wash.SurroundColors = @([System.Drawing.Color]::FromArgb(0, $accent.R, $accent.G, $accent.B))
$g.FillPath($wash, $path)
$wash.Dispose(); $path.Dispose()

# --- knit-stitch texture ----------------------------------------------------
# Mirrors assets/svg/pattern-knit.svg: interlocking loops at low opacity.
$stitch = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(13, 255, 255, 255)), 2
$step = 80
for ($y = -$step; $y -lt ($H + $step); $y += [int]($step / 2)) {
  for ($x = -$step; $x -lt ($W + $step); $x += $step) {
    $arc = New-Object System.Drawing.Rectangle($x, $y, $step, $step)
    $g.DrawArc($stitch, $arc, 180, 180)
  }
}
$stitch.Dispose()

# --- typography -------------------------------------------------------------
$fEyebrow = New-Object System.Drawing.Font('Segoe UI', 15, [System.Drawing.FontStyle]::Bold)
$fTitle   = New-Object System.Drawing.Font('Segoe UI', 74, [System.Drawing.FontStyle]::Bold)
$fBrands  = New-Object System.Drawing.Font('Segoe UI', 30, [System.Drawing.FontStyle]::Regular)
$fFoot    = New-Object System.Drawing.Font('Segoe UI', 19, [System.Drawing.FontStyle]::Regular)

$brWhite = New-Object System.Drawing.SolidBrush($white)
$brMuted = New-Object System.Drawing.SolidBrush($muted)

$padX = 84

# Eyebrow, letterspaced by hand since System.Drawing has no tracking control.
$eyebrow = 'K N I T W E A R   M A N U F A C T U R E R'
$g.DrawString($eyebrow, $fEyebrow, $brMuted, $padX, 96)

# Company name
$g.DrawString('Panwar Knitwear', $fTitle, $brWhite, ($padX - 8), 150)

# Middot as an escape code, not a literal: PowerShell 5.1 reads this script as
# ANSI, so a literal U+00B7 would be mangled into "Â·" in the rendered image.
$dot = [char]0x00B7

# Brands
$g.DrawString("ZONIXA  $dot  MSP Sports", $fBrands, $brMuted, ($padX - 2), 290)

# Accent rule
$rule = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$g.FillRectangle($rule, $padX, 388, 92, 3)
$rule.Dispose()

# Footer line - verified facts only
$g.DrawString('Ludhiana, Punjab, India', $fFoot, $brMuted, $padX, 428)
$products = @('T-Shirts','Hoodies','Sweatshirts','Track Pants','Lowers','Shorts') -join "  $dot  "
$g.DrawString($products, $fFoot, $brMuted, $padX, 466)

# --- save at high quality ---------------------------------------------------
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
         Where-Object { $_.MimeType -eq 'image/jpeg' }
$eps = New-Object System.Drawing.Imaging.EncoderParameters(1)
$eps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, 90)
$bmp.Save($outFile, $codec, $eps)

foreach ($o in @($fEyebrow,$fTitle,$fBrands,$fFoot,$brWhite,$brMuted,$g,$bmp)) { $o.Dispose() }

$kb = [math]::Round((Get-Item $outFile).Length / 1KB, 1)
Write-Output "wrote assets/img/og/og-default.jpg  ${W}x${H}  ${kb} KB"
