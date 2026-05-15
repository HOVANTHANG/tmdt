$file = "src\main\webapp\views\seller\seller-chat.html"
$lines = Get-Content $file -Encoding UTF8

# Fix 1: Replace webjars lines (315-316, 0-indexed 314-315) with CDN
# Fix 2: Remove const token line (319, 0-indexed 318) since menu1.js already has var token

$result = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Replace SockJS webjar with CDN
    if ($line -match 'webjars/sockjs-client') {
        $result += '    <script src="https://cdn.jsdelivr.net/npm/sockjs-client@1.6.1/dist/sockjs.min.js"></script>'
        continue
    }
    
    # Replace STOMP webjar with CDN
    if ($line -match 'webjars/stomp-websocket') {
        $result += '    <script src="https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js"></script>'
        continue
    }
    
    # Remove duplicate const token (menu1.js already declares var token globally)
    if ($line -match 'const token\s*=\s*localStorage\.getItem') {
        $result += '        // token is already declared globally by menu1.js'
        continue
    }
    
    $result += $line
}

$result | Set-Content $file -Encoding UTF8
Write-Host "Done. Total lines: $($result.Count)"
