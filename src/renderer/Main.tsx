import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useRef, useState } from 'react';
import { MyDropzone } from './MyDropzone';

const { spawn } = require('child_process');

export default function Main() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [vms, setVms] = useState<any>();

  const addRepository = () => {
    console.log(inputRef.current?.value);
  };
  const downloadAndRun = () => {
    console.log('process.env.DISPLAY', process.env.DISPLAY);

    // spawn('/opt/homebrew/bin/socat', [
    //   'TCP-LISTEN:6000,reuseaddr,fork',
    //   'UNIX-CLIENT:"$DISPLAY"',
    // ]);
    // const XQuartz = path.join(__dirname, 'assets', 'XQuartz.pkg');
    // console.log(XQuartz);
    // spawn('cp', [XQuartz, '/tmp/']);

    spawn('launchctl', ['getenv', 'DISPLAY']).stdout.on('data', (data: any) => {
      const display = String.fromCharCode(...data).trim();
      console.log(display);
      if (display.length < 3) {
        spawn('launchctl', ['load', '-w', '/tmp/org.xquartz.startx.plist']).on(
          'close',
          () => {
            spawn(
              '/System/Volumes/Data/opt/homebrew/Cellar/virt-viewer/10.8/bin/remote-viewer',
              ['spice://127.0.0.1:5930', '--display', display]
            );
          }
        );
      } else {
        spawn(
          '/System/Volumes/Data/opt/homebrew/Cellar/virt-viewer/10.8/bin/remote-viewer',
          ['spice://127.0.0.1:5930', '--display', display]
        );
      }
    });

    // spawn('/bin/launchctl', ['unload', '-w', '/tmp/org.xquartz.startx.plist']);
    // const ls0 = spawn('/bin/launchctl', [
    //   'load',
    //   '-w',
    //   '/tmp/org.xquartz.startx.plist',
    // ]);
    // ls0.on('close', (code) => {
    //   const ls1 = spawn('/bin/launchctl', ['getenv', 'DISPLAY']);
    //   ls1.stdout.on('data', (data) => {
    //     const display = String.fromCharCode(...data).trim();
    //     console.log(display);
    //     const lsx = spawn(
    //       '/System/Volumes/Data/opt/homebrew/Cellar/virt-viewer/10.8/bin/remote-viewer',
    //       ['spice://127.0.0.1:5930', '--display', display]
    //     );
    //     lsx.stdout.on('data', (data) => {
    //       console.log(`stdout: ${data}`);
    //     });

    //     lsx.stderr.on('data', (data) => {
    //       console.error(`stderr: ${data}`);
    //     });

    //     lsx.on('close', (code) => {
    //       console.log(`child process exited with code ${code}`);
    //     });
    //   });

    //   ls0.stdout.on('data', (data) => {
    //     console.log(`stdout: ${data}`);
    //   });

    //   ls0.stderr.on('data', (data) => {
    //     console.error(`stderr: ${data}`);
    //   });
    // const ls = spawn(
    //   '/System/Volumes/Data/opt/homebrew/Cellar/virt-viewer/10.8/bin/remote-viewer',
    //   ['spice://127.0.0.1:5930']
    // );
    // ls.stdout.on('data', (data) => {
    //   console.log(`stdout: ${data}`);
    // });

    // ls.stderr.on('data', (data) => {
    //   console.error(`stderr: ${data}`);
    // });

    // ls.on('close', (code) => {
    //   console.log(`child process exited with code ${code}`);
    // });
    // });
  };
  return (
    <>
      <Box style={{ marginLeft: 48 }}>
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ flexGrow: 1 }}>
            <TextField fullWidth label="Add repository" inputRef={inputRef} />
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Button color="secondary" onClick={addRepository}>
              Add
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex' }}>
          {vms &&
            vms.map((vm: any) => {
              return (
                <Box>
                  <Box>{vm.name}</Box>
                  <Box>
                    <img
                      src={vm.picture}
                      style={{ width: 200, height: 150 }}
                      alt={vm.name}
                      onClick={downloadAndRun}
                      role="presentation"
                    />
                  </Box>
                </Box>
              );
            })}
        </Box>
        <MyDropzone />
      </Box>
    </>
  );
}
