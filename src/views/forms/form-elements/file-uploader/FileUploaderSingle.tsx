// ** React Imports
// ** MUI Imports
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { ThirdwebStorage } from '@thirdweb-dev/storage'
import { useState } from 'react'
// ** Third Party Imports
import { useDropzone } from 'react-dropzone'

interface FileProp {
  name: string
  type: string
  size: number
}

// Styled component for the upload image inside the dropzone area
const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    marginRight: theme.spacing(15.75)
  },
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(4)
  },
  [theme.breakpoints.down('sm')]: {
    width: 160
  }
}))

interface Props {
  setImageURL: any
}

const FileUploaderSingle = ({ setImageURL }: Props) => {
  // ** State
  const [files, setFiles] = useState<File[]>([])

  const storage = new ThirdwebStorage({
    // gatewayUrls: {
    //   "ipfs://": [process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL as string],
    // },
  })

  // ** Hook
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop: async (acceptedFiles: File[]) => {
      const uri = await storage.upload(acceptedFiles[0])
      setImageURL(uri)
      setFiles(acceptedFiles.map((file: File) => Object.assign(file)))
    }
  })

  const img = files.map((file: FileProp) => (
    <img key={file.name} alt={file.name} className='single-file-image' src={URL.createObjectURL(file as any)} />
  ))

  return (
    <Box {...getRootProps({ className: 'dropzone' })} sx={acceptedFiles.length ? { height: 500 } : {}}>
      <input {...getInputProps()} />
      <Box sx={{ display: 'flex', flexDirection: ['column', 'column', 'row'], alignItems: 'center' }}>
        <Img alt='Upload img' src='/images/misc/upload.png' />
        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: ['center', 'center', 'inherit'] }}></Box>
      </Box>
      {files.length ? img : null}
    </Box>
  )
}

export default FileUploaderSingle
