chrome-har-capturer
===================

Capture HAR files from a remote Chrome instance.

Under the hood this module uses [chrome-remote-interface][cri] to instrument
Chrome.

Usage
-----

Start Chrome with options:

- `--remote-debugging-port=<port>` to enable the
  [Remote Debugging Protocol][rdp] on the port `<port>`;

- `--enable-benchmarking --enable-net-benchmarking` to enable the Javascript
  interface that allows `chrome-har-capturer` to flush the DNS cache and the
  socket pool before loading each URL.

For example:

    google-chrome --remote-debugging-port=9222 \
                  --enable-benchmarking \
                  --enable-net-benchmarking
                  
For MAC Users: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome 
          --remote-debugging-port=9222 --no-first-run --no-default-browser-check 
          --user-data-dir=chrome-remote_data_dir --enable-benchmarking 
          --enable-net-benchmarking
                           
 You will have to install Requestly the first time you run above command

### Use the bundled utility

    Usage: chrome-har-capturer [options] URL...

    Options:

      -h, --help           output usage information
      -r, --reloads <count>    reloads the given url count times
      -o, --output <file>  dump to file instead of stdout
      -d, --delay <ms> Delay between each page load (recommended) 


This module comes with a utility that can be used to generate a cumulative HAR
file from a list of URLs.

Install globally with:

    sudo npm install -g chrome-har-capturer

Load URL as:


    File:      chrome-har-capturer -o test.har  https://www.google.com -r 5 -d 2000
            
    Console:   chrome-har-capturer https://www.google.com -r 5 -d 2000
                        
            
            
            
