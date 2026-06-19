const News = require('../models/News');

// Get all news
exports.getAllNews = async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    let query = { status: 'published' };

    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (search) query.title = { $regex: search, $options: 'i' };

    const news = await News.find(query).sort({ createdAt: -1 }).populate('author', 'name avatar');
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single news
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('author');
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create news
exports.createNews = async (req, res) => {
  try {
    const news = new News({
      ...req.body,
      author: req.user.id,
    });
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
