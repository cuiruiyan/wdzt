import fs from "fs"
import path from "path";
import { add, getfile } from "./storage.js";
import { ConvertDownload } from "./convert.js";


//获取文件信息
export async function fineinfo(file_id: string, version: number): Promise<any> {
  const file = getfile(file_id)
  //console.log('333', file_id, file)
  const fileExtension = path.extname(file.filename).toLowerCase();
  return new Promise((resolve, reject) => {
    const filePath = path.resolve('src/files/' + `${file_id}-${version}${fileExtension}`);
    // 使用fs.stat同步获取文件信息
    fs.stat(filePath, (err, stats) => {
      if (err) {
        return reject(err);
      }
      resolve({
        size: stats.size,  // 文件大小（字节）
        isFile: stats.isFile(),  // 是否是文件
        isDirectory: stats.isDirectory(),  // 是否是目录
        lastModified: stats.mtime,  // 最后修改时间
        created: stats.birthtime  // 创建时间
      });
    });



  });
}

//上传文件，从变量冲去扩展名
// export function uploadfile(file: any, file_id: string, version: number) {
//   //将源文件信息(文件名)存入变量中
//   //console.log('fileupload', file_id, version)
//   const filename = getfile(file_id)
//   //console.log('file', addfile)
//   //获取文件名后缀
//   const fileExtension = path.extname(filename.filename).toLowerCase();
//   //  //需上传文件夹的路径
//   const filePath = path.resolve('src/files', `${file_id}-${version}${fileExtension}`)
//   //const filePath = path.resolve('src/files', `${file_id}-${version}.docx}`)
//   //将上传的文件移动到指定位置
//   return new Promise((resolve, reject) => {
//     fs.rename(file.path, filePath, (err) => {
//       if (err) {
//         reject(err)
//       } else {
//         resolve(true)
//       }
//     })
//   })
// }



//上传文件
export function fileupload(file: any, file_id: string, version: number) {
  //将源文件信息(文件名)存入变量中
  //console.log('fileupload', file_id, version)
  const addfile = add(file_id, {
    filename: file.originalname
  })
  //console.log('file', addfile)
  //获取文件名后缀
  const fileExtension = path.extname(file.originalname).toLowerCase();
  //  //需上传文件夹的路径
  const filePath = path.resolve('src/files', `${file_id}-${version}${fileExtension}`)
  //const filePath = path.resolve('src/files', `${file_id}-${version}.docx}`)
  //将上传的文件移动到指定位置
  return new Promise((resolve, reject) => {
    fs.rename(file.path, filePath, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}

//编辑文件信息回调
export async function editinfo(file_id: string, version: number) {
  const filesize = await fineinfo(file_id, version)
  const download = getDownloadUrl(file_id, version)
  const filename = getfile(file_id)
  //console.log(filename.filename)
  const file = {
    "file": {
      "id": file_id,
      "name": filename.filename,
      "version": version,
      "size": filesize.size,
      "creator": "id1000",
      "create_time": 1136185445,
      "modifier": "id1000",
      "modify_time": 1551409818,
      "download_url": download,
      "preview_pages": 3,
      "user_acl": {
        "rename": 1,
        "history": 1,
        "copy": 1,
        "export": 1,
        "print": 1,
        "comment": 1
      },
    },
    "user": {
      "id": "id1000",
      "name": "wps-1000",
      "permission": "write"
    }
  }
  //console.log(file)
  return file

}

//预览文件信息回调
export async function previewinfo(file_id: string, version: number) {
  //获取本地文件信息
  const filesize = await fineinfo(file_id, version)
  //获取本地文件下载地址
  const download = getDownloadUrl(file_id, version)
  //获取上传文件的文件信息
  const filename = getfile(file_id)
  // console.log(filename)
  const file = {
    "file": {
      "id": file_id,
      "name": filename.filename,
      "version": version,
      "size": filesize.size,
      "creator": "id1000",
      "create_time": 1136185445,
      "modifier": "id1000",
      "modify_time": 1551409818,
      "download_url": download,
      "preview_pages": 3,
      "watermark": {
        "type": 1,
        "value": "网络与信息技术中心 袁林 2024-11-16 ",
        "fillstyle": "rgba(192,192,192,0.6)",
        "font": "normal 18px kaiti",
        //  "rotate": -0.8,
        "horizontal": 150,
        "vertical": 300
      },
      "attrs": {
        "cachetime": "30"
      }
    },
    "user": {
      "id": "id1000",
      "name": "崔芮焱，部门部门部门部门部门部门部门",
      "permission": "read"
    }
  }
  console.log(file)
  return file

}


//本地上传文件下载地址
export function getDownloadUrl(file_id: string, version: number) {
  const file = getfile(file_id)
  const fileExtension = path.extname(file.filename).toLowerCase();
  //console.log(file.filename)
  return `http://8.153.38.238:3000/download/${file_id}-${version}${fileExtension}`
}

//格式处理文件下载地址
export function getTaskDownloadUrl(download_id: string) {
  return `http://8.153.38.238:3000/ConvertDownload?file_id=${download_id}`
}

//上传新版本
export async function save(file_id: string, version: number) {
  const download = getDownloadUrl(file_id, version);
  const filesize = await fineinfo(file_id, version)
  const filen = getfile(file_id)
  const file = {
    "file": {
      "id": file_id,
      "name": filen.filename,
      "version": version,
      "size": filesize.size,
      "download_url": download
    }
  }
  console.log(file)
  return file
}


//格式处理预览文件信息回调
export async function convertpreviewinfo(file_id: string, download_id: string, format: string) {
  const filen = getfile(file_id)
  //console.log('file', filen)
  let name = ''
  if (format == 'operate' || format == 'wrapheader') {
    let fileNameWithoutExt = path.parse(filen.filename).name;
    //console.log('fileNameWithoutExt', fileNameWithoutExt)
    name = `${fileNameWithoutExt}.docx`
    const addfile = add(download_id, {
      filename: name
    })
  } else if (format == 'convert') {
    let fileNameWithoutExt = path.parse(filen.filename).name;
    //console.log('fileNameWithoutExt', fileNameWithoutExt)
    name = `${fileNameWithoutExt}.pdf`
    const addfile = add(download_id, {
      filename: name
    })
  }
  const filesize = await ConvertDownload(download_id)
  const download = getTaskDownloadUrl(download_id)
  const filename = getfile(download_id)
  const file = {
    "file": {
      "id": file_id,
      "name": name,
      "version": 0,
      "size": parseInt(filesize.headers['content-length']),
      "creator": "id1000",
      "create_time": 1136185445,
      "modifier": "id1000",
      "modify_time": 1551409818,
      "download_url": download,
      "preview_pages": 3
    },
    "user": {
      "id": "id1000",
      "name": "wps-1000",
      "permission": "read"
    }
  }
  console.log(file)
  return file
}



