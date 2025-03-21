import cloudinary from 'cloudinary'
import type { CompanyEntity } from '../entity/Company.entity'
import { useEnv } from '../env'
import type { FileTypeEnum } from '../types/File'

const { NODE_ENV } = useEnv()

export async function uploadFileToProvider({
  file,
  company,
  typeOfFile,
}: {
  file: Express.Multer.File
  company: CompanyEntity
  typeOfFile: FileTypeEnum
}) {
  return cloudinary.v2.uploader.upload(file.path, {
    folder: `beright-${NODE_ENV}/company-${company.name}-${company.id}/${typeOfFile}`,
    quality: 'auto',
    fetch_format: 'auto',
    format: 'webp',
  })
}
