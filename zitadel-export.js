
// Run this file to export local zitadel instance
(async () => {
    console.log('starting zitadel export...');
    const res = await fetch('http://localhost:8001/admin/v1/export', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer drL1vhKcd6pxwsY5f3NuRdGbwjGhyWuV3pvplLwGgkry-II2uehnp252CVpT-JU6IfSmQpo',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            org_ids: [],
            excluded_org_ids: [],
            with_passwords: true,
            with_otp: true,
            timeout: '30s',
            response_output: true
        })
    });
    console.log('received response', res.status);
    const json = await res.json();
    (await import('node:fs')).writeFileSync('./zitadel-export.json', JSON.stringify(json, null, 2), {
        encoding: 'utf-8',
    });
    console.log('export successful');
})()