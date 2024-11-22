
//全局变量，存储文件信息
const file: {
  [key: string]: {
    filename: string
  }
} = {}

export function add(file_id: string, obj: {
  filename: string
}) {
  file[file_id] = obj
  // console.log('obj', obj)
  console.log('file', file)
}



//查询文件信息
export function getfile(file_id: string) {
  const id = file[file_id];
  return id
}


