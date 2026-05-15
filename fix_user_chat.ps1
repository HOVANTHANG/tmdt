$file = "src\main\webapp\views\user\user-chat.html"
$lines = Get-Content $file -Encoding UTF8

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
    
    $result += $line
}

$result | Set-Content $file -Encoding UTF8
Write-Host "Done. Total lines: $($result.Count)"
