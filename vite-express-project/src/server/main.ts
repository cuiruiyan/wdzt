import express from "express";
import multer from "multer";
import path from "path";
import ViteExpress from "vite-express";
import { convertpreviewinfo, editinfo, fileupload, previewinfo, save } from "./util/info.js";
import fs from "fs"
import { convertpreview, edit, preview } from "./util/preview.js";
import { getfile } from "./util/storage.js";
import { ConvertDownload, convertTwo, operate, wrapheader } from "./util/convert.js";
import { customAlphabet } from 'nanoid';


const app = express();

app.use(express.static(path.resolve('src/html')))

let version = 1
function encodeRFC5987ValueChars(str: any) {
  return str.split('').map((char: any) => {
    const code = char.charCodeAt(0);
    if (code > 0x7F || code <= 0x20 || ['"', ',', ';'].includes(char)) {
      return `=%${code.toString(16).toUpperCase()}`;
    }
    return char;
  }).join('');
}

const storage = multer.diskStorage({
  //destination 指定了文件的临时存储路径为 temp/
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // 文件存储路径，临时缓存目录
  },
  // filename 指定了文件的名称，包括时间戳和原始文件扩展名
  filename: function (req, file, cb) {
    // cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop()) // 文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

//文件上传
app.post('/api/upload', upload.single('file'), (req, res) => {
  console.log(req.file)
  const version_id = 1
  // 设置 Content-Disposition 头，支持中文文件名
  const encodedFileName = encodeRFC5987ValueChars(req.file?.originalname);
  res.setHeader('Content-Disposition', `attachment; filename*="${encodedFileName}"`)
  const upload = fileupload(req.file, req.body.file_id as string, version_id)
  res.send('文档上传成功')

})

//本地文件下载
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const file = path.join(path.resolve('src/files'), filename);


  res.setHeader('Content-disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-type', 'application/octet-stream');

  // 创建一个可读流
  const fileStream = fs.createReadStream(file);

  // 将文件流通过管道传输到响应对象
  fileStream.pipe(res);
});

//生成预览链接
app.get('/previewhtml', async (req, res) => {
  if (req.query.bool == 'true') {
    const _w_third_permission = 'read'
    let type = ''
    const filename = getfile(req.query.file_id as string)
    const fileExtension = path.extname(filename.filename).toLowerCase();
    if (['.doc', '.dot', '.wps', '.wpt', '.docx', '.dotx', '.docm', '.dotm', '.rtf', '.txt', '.mht', '.mhtml', '.htm', '.html', '.uot3'].includes(fileExtension)) {
      type = 'w'
    } else if (['.xls', '.xlt', '.et', '.xlsx', '.xltx', '.sv', '.xlsm', '.xltm', '.ett'].includes(fileExtension)) {
      type = 'x'
    } else if (['.ppt', '.pptx', '.pptm', '.ppsx', '.ppsm', '.pps', '.potx', '.potm', '.dpt', '.dps', '.pot'].includes(fileExtension)) {
      type = 'p'
    } else if (['.pdf', '.ofd'].includes(fileExtension)) {
      type = 'f'
    } else if (['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tif', '.tiff', '.svg', '.psd'].includes(fileExtension)) {
      type = 'x'
    } else {
      console.log("文件类型不支持")
    }
    //const filepreview = await preview(req.query.file_id as string, type, _w_third_permission)
    const filepreview = await preview(req.query.file_id as string, type, _w_third_permission)
    //console.log(filepreview.)
    res.send(filepreview.data)
  } else if (req.query.convertfile == 'false') {
    const _w_third_permission = 'read'
    if (req.query.format == 'convert') {
      let type = ''
      if (req.query.type == 'pdf') {
        type = 'f'
      } else if (req.query.type == 'wps', req.query.type == 'docx', req.query.type == 'dotx') {
        type = 'w'
      } else {
        alert('文件类型不支持')
      }
      const convertPreview = await convertpreview(req.query.file_id as string, req.query.download_id as string, type, _w_third_permission, req.query.convertfile as string, req.query.format as string)
      res.send(convertPreview.data)
    } else if (req.query.format == 'operate' || req.query.format == 'wrapheader') {
      const type = 'w'
      const preview = await convertpreview(req.query.file_id as string, req.query.download_id as string, type, _w_third_permission, req.query.convertfile as string, req.query.format as string)
      res.send(preview.data)
    } else {
      console.log('输入有误')
    }
  } else {
    console.log('输入错误')
  }

});

//生成编辑编辑
app.get('/edithtml', async (req, res) => {
  const _w_third_permission = 'write'
  let type = ''
  const filename = getfile(req.query.file_id as string)
  const fileExtension = path.extname(filename.filename).toLowerCase();
  if (['.doc', '.dot', '.wps', '.wpt', '.docx', '.dotx', '.docm', '.dotm'].includes(fileExtension)) {
    type = 'w'
  } else if (['.xls', '.xlt', '.et', '.xlsx', '.xltx', '.sv', '.xlsm', '.xltm'].includes(fileExtension)) {
    type = 'x'
  } else if (['.ppt', '.pptx', '.pptm', '.ppsx', '.ppsm', '.pps', '.potx', '.potm', '.dpt', '.dps'].includes(fileExtension)) {
    type = 'p'
  } else if (['.pdf'].includes(fileExtension)) {
    type = 'f'
  } else {
    console.log("文件类型不支持")
  }
  const edithtml = await edit(req.query.file_id as string, type, _w_third_permission)
  res.send(edithtml.data)
});

//文件信息回调
app.get('/v1/3rd/file/info', async (req, res) => {
  console.log(req.headers)
  console.log(req.headers)
  if (req.query._w_third_permission == 'read') {
    if (req.query._w_third_locality == 'false') {
      const convertpreview = await convertpreviewinfo(req.headers['x-weboffice-file-id'] as string, req.query.download_id as string, req.query._w_third_format as string)
      //console.log(preview)
      res.send(convertpreview)
    } else {
      const preview = await previewinfo(req.headers['x-weboffice-file-id'] as string, version)
      console.log(preview)
      res.send(preview)
    }
  } else {
    const edit = await editinfo(req.headers['x-weboffice-file-id'] as string, version);
    res.send(edit)
  }
})

//上传新版本
app.post('/v1/3rd/file/save', upload.single('file'), async (req, res) => {
  // console.log(req.file)
  version = version + 1
  const file = fileupload(req.file, req.headers['x-weboffice-file-id'] as string, version)

  const uploadsave = await save(req.headers['x-weboffice-file-id'] as string, version)
  res.send(uploadsave)
})

//格式转换
app.post('/convert', upload.single('file'), async (req, res) => {
  // 创建一个只包含数字的字符集
  const nanoid = customAlphabet('0123456789', 8);
  // 生成一个8位的数字字符串
  const taskId = nanoid();
  console.log(`Task ID: ${taskId}`);
  //console.log('0000', req.query.file_id as string, version, taskId, req.body.type as string)
  const fileconver = await convertTwo(req.query.file_id as string, version, taskId, req.body.type as string)
  res.send(fileconver.data)
})

//格式转换下载
app.get('/ConvertDownload', async (req, res) => {
  //const filename = '123.docx'
  /// console.log(req..file_id)
  const filename = getfile(req.query.file_id as string)
  const download = await ConvertDownload(req.query.file_id as string)
  // console.log(download)
  res.setHeader('Content-disposition', `attachment; filename=${filename.filename}`); //告诉浏览器这是一个附件，并建议以提供的文件名保存。
  res.setHeader('Content-type', 'application/octet-stream'); //是一种通用的二进制数据类型。如果你知道文件的具体 MIME 类型，可以更精确地设置这个值。
  //console.log(download.data)
  //console.log('data', download.data)
  //console.log('data', parseInt(download.headers['content-length']))
  download.data.pipe(res)
});

//内容处理
app.post('/operate', async (req, res) => {
  // 创建一个只包含数字的字符集
  const nanoid = customAlphabet('0123456789', 8);
  // 生成一个8位的数字字符串
  const taskId = nanoid();
  console.log(`Task ID: ${taskId}`);
  // console.log('0000', req.query.file_id as string, version, taskId, req.body.type as string)
  const fileoperate = await operate(req.query.file_id as string, version, taskId)
  res.send(fileoperate.data)
})


//书签套用
app.post('/wrapheader', async (req, res) => {
  // 创建一个只包含数字的字符集
  const nanoid = customAlphabet('0123456789', 8);
  // 生成一个8位的数字字符串
  const taskId = nanoid();
  console.log(`Task ID: ${taskId}`);
  // console.log('0000', req.query.file_id as string, version, taskId, req.body.type as string)
  const filewrapheader = await wrapheader(req.query.file_id as string, version, taskId)
  res.send(filewrapheader.data)
})

//文件重命名
app.put('/v1/3rd/file/rename', async (req, res) => {
  console.log('---------')
  // console.log('name', req.body.name)
  // res.send(req.body)
  res.status(200)

})




ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
