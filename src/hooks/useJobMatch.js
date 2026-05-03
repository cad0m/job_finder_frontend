import { useState, useEffect } from 'react';
import { supabaseDB } from '../services/supabaseDB';

export const useJobMatch = (candidateProfile) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    roleType: 'All',
    minSalary: 0,
    experienceLevel: 'All'
  });
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchAndMatchJobs = async () => {
      // Tsenn 7ta profile loading ytmm — matbdach b jobs 3adiyin
      if (candidateProfile === undefined) return;

      // If we don't have a profile yet, we can't do AI matching, so we show all jobs for now
      if (!candidateProfile?.user_id) {
        console.log('No profile ID found yet, fetching all jobs as fallback...');
        setLoading(true);
        const allJobs = await supabaseDB.getJobs();
        setJobs(allJobs || []);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Attempting AI-powered matching for user:', candidateProfile.user_id);
        const recommendedJobs = await supabaseDB.getRecommendedJobs(candidateProfile.user_id);

        if (recommendedJobs && recommendedJobs.length > 0) {
          console.log(`Found ${recommendedJobs.length} AI-matched jobs.`);
          setJobs(recommendedJobs);
        } else {
          console.log('AI matching returned no results. Falling back to keyword matching...');
          const allJobs = await supabaseDB.getJobs();
          // Apply manual scoring as a fallback
          const scoredJobs = scoreJobsManually(allJobs || [], candidateProfile);
          setJobs(scoredJobs);
        }
      } catch (err) {
        console.error('Job matching error, falling back to all jobs:', err);
        const allJobs = await supabaseDB.getJobs();
        setJobs(allJobs || []);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMatchJobs();
  }, [candidateProfile]);

  // Helper for manual keyword scoring (fallback)
  const scoreJobsManually = (baseJobs, profile) => {
    if (!profile?.skills) return baseJobs;

    const skillsList = Array.isArray(profile.skills)
      ? profile.skills.map(s => String(s).toLowerCase())
      : String(profile.skills).toLowerCase().split(/[,\s]+/).map(s => s.trim());

    return baseJobs.map(job => {
      let score = 0;
      let matches = 0;
      const jobSkills = (Array.isArray(job.skills) ? job.skills : []).map(s => String(s).toLowerCase());

      if (jobSkills.length === 0) return { ...job, match_score: job.match_score || 0 };

      jobSkills.forEach(skill => {
        if (skillsList.some(s => s.includes(skill) || skill.includes(s))) {
          matches++;
        }
      });

      // Calculate a percentage based on skill match
      score = Math.round((matches / jobSkills.length) * 100);

      // If AI matched it (gave it a score) but it's 0, or if no AI score exists, use manual
      const finalScore = (job.match_score && job.match_score > 0) ? job.match_score : score;

      return { ...job, match_score: finalScore };
    }).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  };

  useEffect(() => {
    let result = [...jobs];

    // Search Filter
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(j =>
        (j.title?.toLowerCase().includes(lowerQ)) ||
        (j.company?.toLowerCase().includes(lowerQ)) ||
        (j.skills?.some(tag => String(tag).toLowerCase().includes(lowerQ)))
      );
    }

    // Role Type Filter
    if (filters.roleType !== 'All') {
      result = result.filter(j => j.role_type === filters.roleType);
    }

    // Experience Level Filter
    if (filters.experienceLevel !== 'All') {
      result = result.filter(j => j.experience_level === filters.experienceLevel);
    }

    // Salary Filter (assuming salary_value exists or parsing salary_range)
    if (filters.minSalary > 0) {
      result = result.filter(j => (j.salary_value || 0) >= filters.minSalary);
    }

    setFilteredJobs(result);
  }, [searchQuery, jobs, filters]);

  const loadMore = () => setVisibleCount(prev => prev + 6);

  return {
    jobs: filteredJobs.slice(0, visibleCount),
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    loadMore,
    hasMore: visibleCount < filteredJobs.length,
    totalCount: filteredJobs.length
  };
};
