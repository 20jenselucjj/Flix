import { Request, Response } from 'express';
import { supabaseService } from '../services/supabase.service.js';

export const getHistory = async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const history = await supabaseService.getHistory(userId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const saveProgress = async (req: Request, res: Response) => {
  const { userId, mediaId, mediaType, progress, timestamp, duration, season, episode, mediaDetails } = req.body;

  if (!userId || !mediaId || !mediaType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await supabaseService.upsertHistory({
      user_id: userId,
      media_id: mediaId,
      media_type: mediaType,
      season: season || 0,
      episode: episode || 0,
      progress,
      timestamp,
      duration,
      last_watched: new Date().toISOString(),
      media_details: mediaDetails,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
};

export const getSearchHistory = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const history = await supabaseService.getSearchHistory(userId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
};

export const addToSearchHistory = async (req: Request, res: Response) => {
  const { userId, query } = req.body;

  if (!userId || !query || !String(query).trim()) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await supabaseService.addToSearchHistory(userId, String(query));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving search history:', error);
    res.status(500).json({ error: 'Failed to save search history' });
  }
};

export const clearSearchHistory = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await supabaseService.clearSearchHistory(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing search history:', error);
    res.status(500).json({ error: 'Failed to clear search history' });
  }
};
