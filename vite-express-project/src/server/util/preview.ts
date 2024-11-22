import { formatToRFC2822, getSignature, postSignature } from "./wps4.js"
import axios from "axios";
import config from '../config.js';
import { json } from "stream/consumers";
import { fineinfo, getDownloadUrl } from "./info.js";

//获取预览链接
export async function preview(file_id: string, type: string, _w_third_permission: string) {
  const api = `/api/preview/v1/files/${file_id}/link?_w_third_permission=${_w_third_permission}&type=${type}`
  const WpsDocsDate = formatToRFC2822(new Date());
  // console.log(getSignature(api, WpsDocsDate))
  return await axios.get(`${config.url}${api}`, {
    headers: {
      'Content-Type': config.ContentType,
      'Wps-Docs-Date': WpsDocsDate,
      'Wps-Docs-Authorization': getSignature(api, WpsDocsDate)
    },
  })

}


//获取编辑链接
export async function edit(file_id: string, type: string, _w_third_permission: string) {
  const api = `/api/edit/v1/files/${file_id}/link?_w_third_permission=${_w_third_permission}&type=${type}`
  const WpsDocsDate = formatToRFC2822(new Date());
  const edit = await axios.get(`${config.url}${api}`, {
    headers: {
      'Content-Type': config.ContentType,
      'Wps-Docs-Date': WpsDocsDate,
      'Wps-Docs-Authorization': getSignature(api, WpsDocsDate)
    },
  })
  return edit;
}




//获取预览链接(新) 改造后
export async function convertpreview(file_id: string, download_id: string, type: string, _w_third_permission: string, _w_third_locality: string, _w_third_format: string) {
  //const preview_mode = 'high_definition'
  //const wpspreview = '1110010'
  const api = `/api/preview/v1/files/${file_id}/link?_w_third_permission=${_w_third_permission}&type=${type}&_w_third_locality=${_w_third_locality}&download_id=${download_id}&_w_third_format=${_w_third_format}`
  const WpsDocsDate = formatToRFC2822(new Date());
  return await axios.get(`${config.url}${api}`, {
    headers: {
      'Content-Type': config.ContentType,
      'Wps-Docs-Date': WpsDocsDate,
      'Wps-Docs-Authorization': getSignature(api, WpsDocsDate)
    },
  })
}