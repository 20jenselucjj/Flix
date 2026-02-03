import { Request, Response } from 'express';
import { supabaseService } from '../services/supabase.service.js';

export const getMyList = async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const list = await supabaseService.getMyList(userId);
    res.json(list);
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({ error: 'Failed to fetch list' });
  }
};

export const addToList = async (req: Request, res: Response) => {
  const { userId, mediaId, mediaType, mediaDetails } = req.body;

  if (!userId || !mediaId || !mediaType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await supabaseService.addToMyList({
      user_id: userId,
      media_id: mediaId,
      media_type: mediaType,
      media_details: mediaDetails,
      added_at: new Date().toISOString(),
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding to list:', error);
    res.status(500).json({ error: 'Failed to add to list' });
  }
};

export const removeFromList = async (req: Request, res: Response) => {
  const { userId, mediaId } = req.params;

  if (!userId || !mediaId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await supabaseService.removeFromMyList(userId, parseInt(mediaId));
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing from list:', error);
    res.status(500).json({ error: 'Failed to remove from list' });
  }
};
