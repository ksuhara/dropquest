// ** React Imports
import { useState, SyntheticEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { styled } from '@mui/material/styles'
import Typography, { TypographyProps } from '@mui/material/Typography'

import { ThirdwebStorage } from '@thirdweb-dev/storage'

// ** Third Party Imports
import { useDropzone } from 'react-dropzone'

interface FileProp {
  name: string
  type: string
  size: number
}

interface FileProp {
  setImageURL: () => {}
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

// Styled component for the heading inside the dropzone area
const HeadingTypography = styled(Typography)<TypographyProps>(({ theme }) => ({
  marginBottom: theme.spacing(5),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(4)
  }
}))

const FileUploaderSingle = ({ setImageURL }) => {
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
        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: ['center', 'center', 'inherit'] }}>
          <HeadingTypography variant='h5'>Drop files here or click to upload.</HeadingTypography>
          <Typography color='textSecondary'>Drop files here or click </Typography>
        </Box>
      </Box>
      {files.length ? img : null}
    </Box>
  )
}

export default FileUploaderSingle
