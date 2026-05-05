import { supabase } from '../lib/supabaseClient';

export const supabaseDB = {
  /**
   * Save candidate profile data into user_profile table.
   * This is called after uploading CV and reviewing the parsed data.
   */
  saveProfile: async (candidateInfo, userId) => {
    try {
      // Instead of excluding unknown fields, explicitly pick only the fields we know exist in the candidates table
      const safeCandidateInfo = {
        full_name: candidateInfo.full_name,
        email: candidateInfo.email,
        location: candidateInfo.location,
        phone: candidateInfo.phone,
        professional_summary: candidateInfo.professional_summary,
        seniority_level: candidateInfo.seniority_level,
        years_experience: candidateInfo.years_experience,
        experience: candidateInfo.experience,
        skills: candidateInfo.skills,
        education: candidateInfo.education,
        languages: candidateInfo.languages,
        ...(candidateInfo.cv_url && { cv_url: candidateInfo.cv_url }),
        ...(candidateInfo.cv_path && { cv_path: candidateInfo.cv_path }),
        ...(candidateInfo.linkedin_url && { linkedin_url: candidateInfo.linkedin_url }),
        ...(candidateInfo.github_url && { github_url: candidateInfo.github_url }),
        ...(candidateInfo.portfolio_url && { portfolio_url: candidateInfo.portfolio_url })
      };

      // Remove undefined values so Supabase doesn't complain or overwrite with nulls
      Object.keys(safeCandidateInfo).forEach(key => safeCandidateInfo[key] === undefined && delete safeCandidateInfo[key]);

      const { data, error } = await supabase
        .from('candidates')
        .upsert({
          user_id: userId,
          ...safeCandidateInfo,
          email: (await supabase.from('user_account').select('email').eq('id', userId).single()).data?.email ?? safeCandidateInfo.email,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('saveProfile full error:', err);
      throw err;
    }
  },

  /**
   * Fetch a list of jobs, optionally filtered by a text query.
   */
  getJobs: async (searchQuery = '') => {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          seniority_level,
          salary,
          posted_date,
          job_description,
          job_url,
          company:company_id ( name, logo_url ),
          location:location_id ( city, region, country )
        `);

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,job_description.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) { console.error('getJobs error:', error); return []; }

      // Flatten pour matcher ce que la UI attend
      return (data || []).map(job => ({
        ...job,
        company: job.company?.name ?? 'Unknown',
        logo_url: job.company?.logo_url ?? null,
        location: job.location
          ? [job.location.city, job.location.country].filter(Boolean).join(', ')
          : null,
        salary_range: job.salary ? `$${(job.salary / 1000).toFixed(0)}k` : null,
        salary_value: job.salary ?? 0,
        posted_at: job.posted_date
          ? new Date(job.posted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : null,
        role_type: 'Full-time',       // Si t'as pas cette colonne encore, default value
        skills: [],                    // Pareil — mettre [] pour éviter crash
        experience_level: job.seniority_level ?? 'All',
      }));
    } catch (err) {
      console.error('getJobs exception:', err);
      return [];
    }
  },

  /**
   * Fetch a single job by its ID.
   */
  /**
   * Fetch a single job by its ID with company and location details.
   */
  getJobById: async (jobId) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          seniority_level,
          salary,
          posted_date,
          job_description,
          job_url,
          num_application,
          company:company_id ( name, logo_url, website ),
          location:location_id ( city, region, country )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;

      return {
        ...data,
        company: data.company?.name ?? 'Unknown',
        logo_url: data.company?.logo_url ?? null,
        company_website: data.company?.website ?? null,
        location: data.location
          ? [data.location.city, data.location.country].filter(Boolean).join(', ')
          : null,
        salary_range: data.salary ? `$${(data.salary / 1000).toFixed(0)}k` : null,
        posted_at: data.posted_date
          ? new Date(data.posted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : null,
        experience_level: data.seniority_level ?? null,
        description: data.job_description ?? null,
      };
    } catch (err) {
      console.error('getJobById error:', err);
      return null;
    }
  },

  getCandidateProfile: async (userId, email) => {
    try {
      // 1. Try fetching by user_id first
      const { data: byId } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (byId) return byId;

      // 2. Fallback: Search by email for guest uploads
      if (email) {
        const { data: byEmail } = await supabase
          .from('candidates')
          .select('*')
          .ilike('email', email.trim())
          .is('user_id', null)
          .maybeSingle();

        if (byEmail) {
          // Link this guest record to the current user
          await supabase
            .from('candidates')
            .update({ user_id: userId })
            .eq('id', byEmail.id);

          return { ...byEmail, user_id: userId };
        }
      }

      return null;
    } catch (err) {
      console.error('getCandidateProfile error:', err);
      return null;
    }
  },

  /**
   * Save a job application record.
   * Checks if an application already exists for this (user, job) and updates it if so.
   */
  saveJobApplication: async (applicationData) => {
    try {
      // Check if an application already exists for this user and job
      const { data: existingApp } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', applicationData.user_id)
        .eq('job_id', applicationData.job_id)
        .maybeSingle();

      if (existingApp) {
        // Update existing application
        const { data, error } = await supabase
          .from('job_applications')
          .update({
            ...applicationData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingApp.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new application
        const { data, error } = await supabase
          .from('job_applications')
          .insert(applicationData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (err) {
      console.error('saveJobApplication error:', err);
      throw err;
    }
  },

  /**
   * Fetch all applications for a user with job details.
   */
  getApplications: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs(
            id,
            title,
            seniority_level,
            salary,
            posted_date,
            company:company_id ( name, logo_url ),
            location:location_id ( city, country )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(app => ({
        ...app,
        job: app.job ? {
          ...app.job,
          company: app.job.company?.name ?? 'Unknown',
          logo_url: app.job.company?.logo_url ?? null,
          location: app.job.location
            ? [app.job.location.city, app.job.location.country].filter(Boolean).join(', ')
            : null,
          salary_range: app.job.salary ? `$${(app.job.salary / 1000).toFixed(0)}k` : null,
          posted_at: app.job.posted_date
            ? new Date(app.job.posted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : null,
        } : null
      }));
    } catch (err) {
      console.error('getApplications error:', err);
      return [];
    }
  },

  /**
   * AI-Powered Job Matching using Vector Search and multi-component scoring.
   */
  getRecommendedJobs: async (userId, count = 50) => {
    try {
      const { data, error } = await supabase.rpc('match_jobs_for_user', {
        p_user_id: userId,
        p_match_count: count,
        p_min_score: 0.0
      });

      if (error) {
        console.error('RPC Error:', error.message, error.hint);
        throw error;
      }

      console.log(`RPC returned ${(data || []).length} jobs`);

      return (data || []).map(job => ({
        ...job,
        match_score: Math.round((job.match_score || 0) * 100)
      }));

    } catch (err) {
      console.error('getRecommendedJobs error:', err);
      return [];
    }
  },

  /**
   * Fetch social link URLs from the user's most recent job application,
   * used to pre-fill the Professional Links form.
   */
  getLastApplicationSocials: async (userId) => {
    try {
      const { data } = await supabase
        .from('job_applications')
        .select('linkedin_url, github_url, portfolio_url')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data ?? null;
    } catch (err) {
      console.error('getLastApplicationSocials error:', err);
      return null;
    }
  },

  /**
   * Download a set of PDF application files as blobs to trigger named
   * browser downloads. Falls back to opening in a new tab on CORS errors.
   * @param {{ cv?: string, cover_letter?: string, email?: string }} files - Signed URLs
   */
  downloadApplicationFiles: async (files) => {
    const fileList = [
      { url: files.cv, name: 'CV.pdf' },
      { url: files.cover_letter, name: 'CoverLetter.pdf' },
      { url: files.email, name: 'ColdEmail.pdf' },
    ];
    for (const file of fileList) {
      if (!file.url) continue;
      try {
        const res = await fetch(file.url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        // Stagger downloads so the browser doesn't block them
        await new Promise(r => setTimeout(r, 400));
      } catch {
        // Fallback: open in new tab if fetch fails (e.g. CORS)
        window.open(file.url, '_blank');
      }
    }
  },

  /**
   * Search jobs semantically using a pre-computed embedding vector.
   * Calls `match_jobs_by_text` RPC. Falls back to keyword search on error.
   * @param {number[]} embedding - The embedding vector from invokeEmbedText
   * @param {string}   rawQuery  - Original query string (used for keyword fallback)
   * @param {number}   count     - Max results to return
   */
  searchJobsByEmbedding: async (embedding, rawQuery = '', count = 20) => {
    try {
      const { data, error } = await supabase.rpc('match_jobs_by_text', {
        query_embedding: embedding,
        match_count: count,
        min_score: 0.0,
      });

      if (error) throw error;

      return (data || []).map(job => ({
        ...job,
        match_score: Math.round(
          (job.match_score ?? job.similarity ?? 0) * 100
        ),
      }));
    } catch (err) {
      // RPC may not exist yet — graceful keyword fallback
      console.warn('searchJobsByEmbedding: RPC failed, falling back to keyword search.', err.message);
      const fallback = await supabaseDB.getJobs(rawQuery);
      // keyword results have no vector score — mark as null
      return fallback.map(job => ({ ...job, match_score: null }));
    }
  },


  /**
   * Check if a job is saved by the user.
   */
  checkIfJobSaved: async (userId, jobId) => {
    try {
      const { data, error } = await supabase
        .from('user_job_interactions')
        .select('id')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .eq('action', 'saved')
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error('checkIfJobSaved error:', err);
      return false;
    }
  },

  /**
   * Toggle saved status for a job.
   * Prevents duplicates by checking if the job is already saved.
   */
  toggleSavedJob: async (userId, jobId, isSaved) => {
    try {
      if (isSaved) {
        // Unsave (Remove) all entries for this (user, job, action='saved')
        const { error } = await supabase
          .from('user_job_interactions')
          .delete()
          .eq('user_id', userId)
          .eq('job_id', jobId)
          .eq('action', 'saved');
        if (error) throw error;
        return false; // Now unsaved
      } else {
        // Save (Insert) only if it doesn't exist
        const { data: existing } = await supabase
          .from('user_job_interactions')
          .select('id')
          .eq('user_id', userId)
          .eq('job_id', jobId)
          .eq('action', 'saved')
          .maybeSingle();

        if (existing) {
          return true; // Already saved
        }

        const { error } = await supabase
          .from('user_job_interactions')
          .insert({
            user_id: userId,
            job_id: jobId,
            action: 'saved',
            positive_signal: true
          });
        if (error) throw error;
        return true; // Now saved
      }
    } catch (err) {
      console.error('toggleSavedJob error:', err);
      throw err;
    }
  },

  /**
   * Fetch all saved jobs for a specific user.
   */
  getSavedJobs: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_job_interactions')
        .select(`
          id,
          created_at,
          job:jobs(
            id,
            title,
            seniority_level,
            salary,
            posted_date,
            job_description,
            company:company_id ( name, logo_url ),
            location:location_id ( city, country )
          )
        `)
        .eq('user_id', userId)
        .eq('action', 'saved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Extract and map the job data
      return (data || []).map(record => {
        if (!record.job) return null;
        return {
          ...record.job,
          saved_id: record.id, // ID of the interaction row
          saved_at: record.created_at, // Map created_at to saved_at for UI
          company: record.job.company?.name ?? 'Unknown',
          logo_url: record.job.company?.logo_url ?? null,
          location: record.job.location
            ? [record.job.location.city, record.job.location.country].filter(Boolean).join(', ')
            : null,
          salary_range: record.job.salary ? `$${(record.job.salary / 1000).toFixed(0)}k` : null,
          posted_at: record.job.posted_date
            ? new Date(record.job.posted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : null,
          experience_level: record.job.seniority_level ?? 'All',
          match_score: null, // Since we don't calculate AI vector score for the saved list yet
        };
      }).filter(Boolean);
    } catch (err) {
      console.error('getSavedJobs error:', err);
      return [];
    }
  },
};

