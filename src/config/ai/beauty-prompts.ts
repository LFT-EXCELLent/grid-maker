export type BeautyPromptOption = {
  id: string;
  prompt: string;
};

export type BeautyPromptConfig = Record<string, BeautyPromptOption[]>;

export const BEAUTY_PROMPT_CONFIG: BeautyPromptConfig = {
  general: [
    {
      id: 'blurred_background',
      prompt:
        'blur the background while keeping the person sharp and in focus, create shallow depth of field, natural lens bokeh effect',
    },
    {
      id: 'lighting_supplement',
      prompt:
        'apply smart fill light on the face, softly brighten shadows, keep highlight detail, natural skin tone, realistic studio portrait lighting',
    },
  ],
  face_shape: [
    {
      id: 'face_slimming',
      prompt:
        'subtly slim cheeks and jawline, keep facial features recognizable, maintain natural proportions, avoid background distortion',
    },
    {
      id: 'double_chin_remover',
      prompt:
        'reduce double chin, smooth jawline and neck area, keep natural skin texture and realistic contours',
    },
    {
      id: 'body_edit',
      prompt:
        'subtle body reshaping, slightly slim waist and limbs, maintain realistic body proportions, avoid warping background',
    },
  ],
  skin: [
    {
      id: 'soft_skin',
      prompt:
        'soft skin smoothing on face, reduce pores and minor texture, keep natural skin details, avoid plastic or over-processed look',
    },
    {
      id: 'wrinkles_remover',
      prompt:
        'reduce facial wrinkles and fine lines, especially around eyes and forehead, keep natural expression and realistic skin texture',
    },
    {
      id: 'remove_acne',
      prompt:
        'remove acne, pimples, dark spots and blemishes on the skin, even tone while keeping pores and natural texture',
    },
    {
      id: 'brighten_skin',
      prompt:
        'slightly brighten skin tone overall, even complexion, keep realistic color and avoid over-whitened unnatural look',
    },
    {
      id: 'reduce_oily',
      prompt:
        'reduce oily shine on forehead, nose and cheeks, soft matte finish while preserving natural skin highlights',
    },
  ],
  eyes: [
    {
      id: 'open_eyes',
      prompt:
        'subtly correct half-closed or sleepy eyes to look naturally open, preserve eye shape and identity, realistic result',
    },
    {
      id: 'remove_dark_circles',
      prompt:
        'lighten dark circles under the eyes, smooth under-eye area, keep natural shadows and realistic skin texture',
    },
    {
      id: 'remove_red_eyes',
      prompt:
        'remove red-eye effect from pupils, natural dark iris and pupil color, keep reflection highlights',
    },
    {
      id: 'eye_refinement',
      prompt:
        'enhance eyes with subtle sharpening, increase iris clarity and contrast, slightly brighten whites of the eyes, maintain natural look',
    },
  ],
  nose: [
    {
      id: 'nose_retouching',
      prompt:
        'refine nose shape slightly, smooth harsh shadows, enhance highlight on nose bridge, keep natural structure and proportions',
    },
  ],
  mouth_teeth: [
    {
      id: 'mouth_grooming',
      prompt:
        'refine shape of lips, smooth lip texture, enhance natural color, correct minor asymmetry while preserving expression',
    },
    {
      id: 'fix_teeth',
      prompt:
        'whiten and clean teeth slightly, remove yellow tint and stains, fix small gaps or chips, maintain realistic tooth texture',
    },
  ],
  hair: [
    {
      id: 'soft_hair',
      prompt:
        'smooth frizzy hair, reduce flyaways, create soft and neat hair strands, keep natural volume and direction',
    },
    {
      id: 'enhanced_hair_luster',
      prompt:
        'increase hair shine, add subtle highlight reflection, rich and healthy hair appearance, avoid metallic or fake glow',
    },
  ],
  artifacts_removal: [
    {
      id: 'remove_glasses_glare',
      prompt:
        'remove glare and reflections on eyeglass lenses, keep frame shape and eye details clearly visible',
    },
    {
      id: 'remove_tattoo',
      prompt:
        'remove visible tattoos on skin, reconstruct natural skin color and texture where tattoo was',
    },
  ],
};
