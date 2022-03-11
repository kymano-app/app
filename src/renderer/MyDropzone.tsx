import { importLayer, sendFile } from './renderer';
import { upload } from './upload';

export function MyDropzone() {
  // sendAsync(binaryStr)
  //   .then((result) => {
  //     console.log(result);
  //     return false;
  //   })
  //   .catch((e) => {
  //     console.log(e)
  //   });

  const readFile = (event: any) => {
    // runGuestFs();
    console.log(event.target.files[0].buffer);
    upload(event.target.files[0], sendFile)
      .then((fileName) => {
        console.log('fileName', fileName);
        importLayer(fileName);
        // addImportLayerToGuestFs();
        // showFileExplorer()
        return true;
      })
      .catch(() => {
        console.log('error');
      });
  };

  return (
    <div>
      <input
        type="file"
        id="video-url-example"
        onChange={(event) => {
          readFile(event);
        }}
      />
      <p>
        For importing just drag and drop Parallels, Virtualbox, VmWare disks
        here.
      </p>
      <p>It`s safe, original files will not be modified.</p>
    </div>
  );
}
