
import { supabase } from '@/integrations/supabase/client';

export const uploadFile = async (file: File, fileName: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `documents/${fileName}.${fileExt}`;
    console.log('[UPLOAD] Start uploading:', { filePath, file });

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('[UPLOAD ERROR] Supabase Storage:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    if (!data || !data.publicUrl || typeof data.publicUrl !== 'string') {
      const errMsg = 'Could not generate a public URL for: ' + filePath;
      console.error('[GENERATE URL ERROR]', errMsg, data);
      throw new Error(errMsg);
    }

    console.log('[UPLOAD] Success:', { filePath, publicUrl: data.publicUrl });
    return data.publicUrl;
  } catch (err) {
    throw err;
  }
};
