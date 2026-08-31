# Verifies the runtime CONTRACTS between HTML and JS that a browser would
# exercise: does every JS query find markup, and does every markup hook have
# JS behind it? Catches wiring mistakes without needing a JS engine.

$d = Split-Path $PSScriptRoot -Parent
$fails = 0
function Check($name, $cond, $detail="") {
  $script:fails += if ($cond) { 0 } else { 1 }
  "{0} {1}{2}" -f $(if($cond){"PASS"}else{"FAIL"}), $name, $(if($detail){"  -> $detail"}else{""})
}

$cfg     = Get-Content "$d\assets\js\site.config.js" -Raw
$ui      = Get-Content "$d\assets\js\ui.js" -Raw
$nav     = Get-Content "$d\assets\js\nav.js" -Raw
$forms   = Get-Content "$d\assets\js\forms.js" -Raw
$contact = Get-Content "$d\contact.html" -Raw
$index   = Get-Content "$d\index.html" -Raw

"=== site.config.js integrity ==="
Check "PK namespace created"        ($cfg -match 'window\.PK\s*=\s*window\.PK')
Check "config assigned"             ($cfg -match 'window\.PK\.config\s*=')
Check "3 phone numbers present"     (([regex]::Matches($cfg,'dial:\s*.\+91')).Count -eq 3)
Check "primary phone flagged"       ($cfg -match 'primary:\s*true')
Check "whatsapp dial has no plus"   ($cfg -match "dial:\s*'9198")
Check "email marked todo"           ($cfg -match "email:\s*\{[^}]*todo:\s*true")
Check "street marked todo"          ($cfg -match "street:\s*\{[^}]*todo:\s*true")
Check "8 fabrics listed"            (([regex]::Matches($cfg,"'(Spun Fleece|Dry Fit|Honeycomb Lycra|100% Cotton|Cotton Lycra|NS Bonded|Russian Fleece|Sherpa)'")).Count -eq 8)
Check "4 leadership entries"        (([regex]::Matches($cfg,'\{ name: .[^'']+Panwar.,\s*role:')).Count -eq 4)

""
"=== ui.js <-> markup contract ==="
foreach ($k in @('phone','phone-list','whatsapp','email','locality','street')) {
  Check "ui.js handles data-contact=$k" ($ui -match [regex]::Escape("data-contact=`"$k`""))
}
Check "every data-link key exists in config" (
  $true -notin ( [regex]::Matches(($index+$contact),'data-link="([a-zA-Z]+)"') |
    ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique |
    ForEach-Object { $cfg -notmatch ($_ + ':\s*.http') } )
)

""
"=== forms.js <-> contact.html contract ==="
$ruleNames = [regex]::Matches($forms,'(?m)^\s{4}([a-z]+):\s*\{\s*required') | ForEach-Object { $_.Groups[1].Value }
foreach ($r in $ruleNames) {
  Check "field '$r' exists in form" ($contact -match ('name="' + $r + '"'))
}
foreach ($r in $ruleNames) {
  $req = $forms -match ($r + ":\s*\{\s*required:\s*true")
  if ($req) { Check "required field '$r' has error slot" ($contact -match ('data-error-for="' + $r + '"')) }
}
Check "honeypot field present"       ($contact -match 'name="website"')
Check "honeypot checked in JS"       ($forms -match 'elements\.website')
Check "error summary target exists"  ($contact -match 'data-error-summary')
Check "status region exists"         ($contact -match 'data-form-status')
Check "form has novalidate"          ($contact -match '<form[^>]*novalidate')
Check "submit builds wa.me URL"      ($forms -match 'https://wa\.me/')
Check "message is URL-encoded"       ($forms -match 'encodeURIComponent\(text\)')

""
"=== nav.js contract ==="
Check "toggle exists in markup"      ($index -match 'data-nav-toggle')
Check "drawer exists in markup"      ($index -match 'data-nav-drawer')
Check "scrim exists in markup"       ($index -match 'data-nav-scrim')
Check "sentinel precedes header"     ($index.IndexOf('data-header-sentinel') -lt $index.IndexOf('class="header"'))
Check "aria-controls matches nav id" ($index -match 'aria-controls="primary-nav"' -and $index -match 'id="primary-nav"')
Check "Escape key handled"           ($nav -match "'Escape'")
Check "focus trap on Tab"            ($nav -match "key\s*!==\s*'Tab'")
Check "restores focus on close"      ($nav -match 'lastFocused\.focus')

""
"=== accordion contract (contact.html) ==="
$trig = [regex]::Matches($contact,'data-accordion-trigger[^>]*aria-controls="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
Check "accordion triggers found" ($trig.Count -gt 0) "$($trig.Count) triggers"
foreach ($t in $trig) { Check "panel #$t exists" ($contact -match ('id="' + $t + '"')) }

""
"=== progressive enhancement ==="
Check "no-js class on html"          ($index -match '<html lang="en" class="no-js">')
Check "js flip is inline in head"    ($index.IndexOf("replace('no-js','js')") -lt $index.IndexOf('</head>'))
Check "reveals scoped to .js only"   ((Get-Content "$d\assets\css\09-animations.css" -Raw) -match '\.js \[data-reveal\]')
Check "no-js nav fallback styled"    ((Get-Content "$d\assets\css\04-components.css" -Raw) -match '\.no-js \.nav')
Check "all scripts deferred"         (([regex]::Matches($index,'<script src=')).Count -eq 0)

""
"=== CSS specificity traps ==="
# :not() contributes its argument's specificity; :where() contributes zero.
# The default icon rule must stay zero-specificity or it overrides every
# component icon size (this was a real bug, caught in review).
# Strip comments first — the warning note in that file names the bad selector.
$util = (Get-Content "$d\assets\css\08-utilities.css" -Raw) -replace '(?s)/\*.*?\*/',''
Check "icon default uses :where(), not :not()" (
  ($util -match 'svg:where\(:not\(\.svg-sprite\)\)') -and
  -not ($util -match 'svg:not\(')
)

""
"=== breakpoint sync (CSS drawer query vs nav.js MOBILE_MQ) ==="
$comp    = Get-Content "$d\assets\css\04-components.css" -Raw
$cssBp   = ([regex]::Match($comp,'@media \(max-width:\s*([0-9.]+rem)\)\s*\{[^@]*?\.nav\s*\{')).Groups[1].Value
if (-not $cssBp) { $cssBp = ([regex]::Match($comp,'@media \(max-width:\s*([0-9.]+rem)\)')).Groups[1].Value }
$jsBp    = ([regex]::Match($nav,"MOBILE_MQ\s*=\s*'\(max-width:\s*([0-9.]+rem)\)'")).Groups[1].Value
Check "CSS and JS breakpoints match" ($cssBp -and $jsBp -and ($cssBp -eq $jsBp)) "css=$cssBp js=$jsBp"

""
"=== file:// safety ==="
Check "no external <use> refs"       (-not ((Get-Content "$d\*.html" -Raw) -match '<use href="[^#]'))
Check "no script type=module"        (-not ((Get-Content "$d\assets\js\*.js" -Raw) -match '^\s*import\s'))
$jsNoComments = ((Get-Content "$d\assets\js\*.js" -Raw) -replace '(?s)/\*.*?\*/','') -replace '(?m)//.*$',''
Check "no fetch() of partials"       (-not ($jsNoComments -match 'fetch\('))
Check "no @import in css"            (-not ((Get-Content "$d\assets\css\*.css" -Raw) -match '@import'))

""
"TOTAL FAILURES: $fails"


