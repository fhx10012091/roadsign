import React, { FC, useRef, ChangeEvent, useState } from 'react'
import axios from 'axios'
import Button from '../Button/button'
import UploadList from './uploadList'
export type UploadFileStatus = 'ready' | 'uploading' | 'success' | 'error'
 
export interface UploadFile {
    uid: string;
    name: string;
    size: number;
    status?: UploadFileStatus;
    percent?: number;
    raw?: File;
    response?: any;
    error?: any
}

export interface UploadProps {
    action: string;
    beforeUpload?: (file: File) => boolean | Promise<File>;
    onProgress?: (percentage: number, file: File) => void;
    onSuccess?: (data: any, file: File) => void;
    onError?: (err: any, file: File) => void;
    onChange?: (file: File) => void;
    defaultFileList?: UploadFile[];
    onRemove?: (file: UploadFile) => void;
}

export const Upload: FC<UploadProps> = (props) => {
    const {
        action,
        onProgress,
        defaultFileList,
        onRemove,
        onSuccess,
        onError,
        beforeUpload,
        onChange
    } = props
    
    const fileInput = useRef<HTMLInputElement>(null)
    const [fileList, setFileList] = useState<UploadFile[]>(defaultFileList || [])
    const updateFileList = (updateFile: UploadFile, updateObj: Partial<UploadFile>) => {
        setFileList(prevList => {
            return prevList.map(file => {
                if(file.uid === updateFile.uid){
                    return {...file, ...updateObj}
                }else{
                    return file
                }
            })
        })
    }
    const handleClick = () => {
        if(fileInput.current){
            fileInput.current.click()
        }
    }
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;  
        if(!files){
            return
        }
        UploadFiles(files)
        if(fileInput.current){
            fileInput.current.value = ''
        }
    }
    const post = (file: File) => {
        let _file: UploadFile = {
            uid: Date.now() + 'upload-file',
            status: 'ready',
            name: file.name,
            size: file.size,
            percent: 0,
            raw: file
        }
        setFileList([_file, ...fileList])
        const formData = new FormData()
            formData.append(file.name, file)
            axios.post(action, formData, {
                headers: {
                    'Context-Type': 'multipart/form-data'
                },
                onUploadProgress: (e) => {
                    let percentage = Math.round((e.loaded * 100) / e.total) || 0
                    if(percentage < 100){
                        updateFileList(_file, {percent: percentage, status: 'uploading'})
                        if(onProgress){             
                            onProgress(percentage, file)
                        }
                    }
                    console.log('progress')
                    console.log(fileList)
                }
            }).then(res => {
                console.log(res)
                updateFileList(_file, {status: 'success', response: res.data})
                if(onSuccess){
                    onSuccess(res.data, file)
                }
                if(onChange){
                    onChange(file)
                }
            }).catch(err => {
                console.error(err)
                updateFileList(_file, {status: 'error', error: err})
                if(onError){
                    onError(err, file)
                }
                if(onChange){
                    onChange(file)
                }
            })
    }
    const UploadFiles = (files: FileList) => {
        let postFiles = Array.from(files)     
        postFiles.forEach(file => {
            if(!beforeUpload){
                post(file)
            }else{
                const result = beforeUpload(file)
                if(result && result instanceof Promise){
                    result.then(processedFile => {
                        post(processedFile)
                    })
                }else if(result !== false){
                    post(file)
                }
            }
        })
        
    }
    const handleRemove = (file: UploadFile) => {
        setFileList((prevList) => {
            return prevList.filter(item => item.uid !== file.uid)
        })
        if(onRemove){
            onRemove(file)
        }
    }
    console.log('fileList')
    console.log(fileList)
    return (
        <div className="upload-component">
            <div className="upload-input">
                <Button 
                    btnType="primary"
                    onClick={handleClick}
                    >Upload File</Button>
                <input 
                    type="file" 
                    ref={fileInput}
                    className="file-input"
                    onChange={handleChange}
                    style={{display: 'none'}}/>
            </div>
            <UploadList 
                fileList={fileList}
                onRemove={handleRemove}
            />
        </div>
    )
}
export default Upload;