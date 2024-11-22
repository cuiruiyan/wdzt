
import { formatToRFC2822, getSignature, postSignature } from "./wps4.js"
import axios from "axios";
import config from '../config.js';
import { json } from "stream/consumers";
import { fineinfo, getDownloadUrl } from "./info.js";
import { StringLiteralType } from "typescript";
import request from 'request'
import { add, getfile } from "./storage.js";


//格式转换
// export async function convert(file_id: string, version: number, task_id: string) {
//   // const filesize = await fineinfo(file_id, version)
//   const download = getDownloadUrl(file_id, version)
//   const api = `/api/cps/sync/v1/convert`
//   const WpsDocsDate = formatToRFC2822(new Date());
//   const body = {
//     "task_id": task_id,
//     "doc_filename": "请假条.docx",
//     "doc_url": download,
//     "target_file_format": "pdf",
//   }
//   console.log(download)
//   const convert = axios.post(`${config.url}${api}`, body, {
//     headers: {
//       'Content-Type': config.ContentType,
//       'Wps-Docs-Date': WpsDocsDate,
//       'Wps-Docs-Authorization': postSignature(api, WpsDocsDate, JSON.stringify(body))
//     },
//   })
//   return convert;
// }


//文件下载
export async function ConvertDownload(download_id: string) {
  const api = `/api/cps/v1/download/${download_id}`
  //const downloadMock = getDownloadUrl("4", 1)
  const WpsDocsDate = formatToRFC2822(new Date());
  // const downloadUrl = downloadMock // `${config.url}${api}`
  const download = axios.get(`${config.url}${api}`, {
    headers: {
      'Content-Type': config.ContentType,
      'Wps-Docs-Date': WpsDocsDate,
      'Wps-Docs-Authorization': getSignature(api, WpsDocsDate),
      'Route-Key': '0'
    },
    responseType: 'stream'
  })
  /// console.log('6666', download)

  return download;
}

//格式转换-页面接口
export async function convertTwo(file_id: string, version: number, task_id: string, type: string) {
  // const filesize = await fineinfo(file_id, version)
  const download = getDownloadUrl(file_id, version)
  const file = getfile(file_id);
  const api = `/api/cps/sync/v1/convert`
  const WpsDocsDate = formatToRFC2822(new Date());
  const body = {
    "task_id": task_id,
    "doc_filename": file.filename,
    "doc_url": download,
    "target_file_format": type,
  }
  //console.log(download)
  const convert = axios.post(`${config.url}${api}`, body, {
    headers: {
      'Content-Type': config.ContentType,
      'Wps-Docs-Date': WpsDocsDate,
      'Wps-Docs-Authorization': postSignature(api, WpsDocsDate, JSON.stringify(body))
    },
  })
  return convert;
}

//添加水印
export async function operate(file_id: string, version: number, task_id: string) {

  const download = getDownloadUrl(file_id, version)
  const api = `/api/cps/sync/v1/content/operate`
  const WpsDocsDate = formatToRFC2822(new Date());
  const file = getfile(file_id);
  const body = {
    "task_id": task_id,
    "scene_id": "app_scene_id",
    "doc_url": download,
    "doc_filename": file.filename,
    "steps": [
      {
        "operate": "OFFICE_CLEAN",
        "args": {
          "clean_options": ["accept_all_revisions"]
        }
      },
      {
        "operate": "OFFICE_WATERMARK",
        "args": {
          "text_watermark": {
            "content": "网络与信息技术中心 袁林 2024-11-16",
            "size": 24,
            "color": "#CC00FF",
            "transparent": 0.4,
            "tilt": true,
            "position": "TOP_CENTER",
            "tiled": true
          },
        }
      }

    ]
  }
  return axios.post(`${config.url}${api}`, body, {
    headers: {
      'Content-Type': config.ContentType,
      'Wps-Docs-Date': WpsDocsDate,
      'Wps-Docs-Authorization': postSignature(api, WpsDocsDate, JSON.stringify(body))
    },
  })
}

//书签套用
export async function wrapheader(file_id: string, version: number, task_id: string) {
  const download = getDownloadUrl(file_id, version)
  const api = `/api/cps/sync/v1/wrapheader`
  const WpsDocsDate = formatToRFC2822(new Date());
  const file = getfile(file_id);
  const body = {
    "task_id": task_id,
    "template_url": download,
    "template_filename": file.filename,
    "expand_bookmark": true,
    "sample_list": [
      {
        "bookmark": "shuqian",
        "type": "TEXT",
        "text": "你的你的你的"
      }
      // {
      //   "bookmark": "pian",
      //   "type": "IMAGE",
      //   "sample_url": "http://8.153.38.238:3000/download/109-1.png",
      //   "sample_filename": "109-1.png",
      // }
    ]

  }
  return axios.post(`${config.url}${api}`, body, {
    headers: {
      'Content-Type': config.ContentType,
      'Wps-Docs-Date': WpsDocsDate,
      'Wps-Docs-Authorization': postSignature(api, WpsDocsDate, JSON.stringify(body))
    },
  })
}

