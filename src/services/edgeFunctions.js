import { supabase } from '../lib/supabaseClient';

/**
 * Extracts a readable error message from a Supabase function error.
 */
const extractError = async (error) => {
  let message = error.message;
  if (error.context && typeof error.context.text === 'function') {
    try {
      const rawBody = await error.context.text();
      try {
        const bodyJson = JSON.parse(rawBody);
        if (bodyJson.error) message = bodyJson.error;
      } catch {
        if (rawBody && rawBody.trim() !== '') message = rawBody;
      }
    } catch (e) {
      console.warn('Error extracting body:', e);
    }
  }
  return message;
};

export const edgeFunctions = {
  invokeCvOcr: async ({ fileBase64, filename, mimeType = 'application/pdf' }) => {
    try {
      const { data, error } = await supabase.functions.invoke('cv-ocr', {
        body: { fileBase64, filename, mimeType }
      });

      if (error) {
        const msg = await extractError(error);
        throw new Error(msg);
      }
      return data;
    } catch (err) {
      console.error('OCR Invocation Error:', err);
      throw err;
    }
  },

  invokeEmbedCv: async () => {
    try {
      const { data, error } = await supabase.functions.invoke('embed-cv', { body: {} });
      if (error) {
        const msg = await extractError(error);
        throw new Error(msg);
      }
      return data;
    } catch (err) {
      console.error('Embed CV Error:', err);
      throw err;
    }
  },

  invokeEmbedText: async (text) => {
    try {
      const { data, error } = await supabase.functions.invoke('embed-text', { body: { text } });
      if (error) {
        const msg = await extractError(error);
        throw new Error(msg);
      }
      return data;
    } catch (err) {
      console.error('Embed Text Error:', err);
      throw err;
    }
  },

  /**
   * Step A: Generate JSON data for the application (CV, Cover Letter, Cold Email)
   */
  invokeGenerateCv: async (payload) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-cv', { body: payload });
      if (error) {
        const msg = await extractError(error);
        throw new Error(msg);
      }
      return data; // { data_cv, data_letter, data_email }
    } catch (err) {
      console.error('Generate CV Error:', err);
      throw err;
    }
  },

  /**
   * Step B: Generate PDF files and signed URLs from JSON data
   */
  invokeGeneratePdf: async (payload) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', { body: payload });
      if (error) {
        const msg = await extractError(error);
        throw new Error(msg);
      }
      return data; // { files: { cv, email, cover_letter? } }
    } catch (err) {
      console.error('Generate PDF Error:', err);
      throw err;
    }
  }
};
