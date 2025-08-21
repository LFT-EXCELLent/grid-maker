interface AITool {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const aiToolsData: AITool[] = [
  {
    title: 'img2img',
    description: `Transform or enhance any image with our free Al-powered img2img tool - perfect for image-to-image generation, quality enhancement, and background removal.`,
    imgSrc: '/static/images/img2img.png',
    href: 'https://www.img-2-img.com',
  },
]

export default aiToolsData
