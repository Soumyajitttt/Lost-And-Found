import asyncHandler from "express-async-handler";
import Item from "../models/Items.js";
import matcher from "../utils/matcher.js";
import notify from "../utils/notify.js";

export const createItem = asyncHandler(async (req, res) => {
  const { type, category, title, description, location, contact } = req.body;
  if (!type || !title || !category || !description || !location) {
    res.status(400); 
    throw new Error("All required fields must be filled");
  }
  const photos = req.file ? [req.file.path] : [];

  const itemData = {
    owner: req.user._id, type, category, title, description, location, photos, contact,
    verificationStatus: type === 'lost' ? 'verified' : 'pending'
  };

  const item = await Item.create(itemData);

  if (item.type === 'lost') {
    // A lost item is verified by default, so match it immediately against verified found items.
    const candidates = await Item.find({ type: 'found', status: 'active', verificationStatus: 'verified' }).populate('owner', 'name email');
    const matches = matcher.matchItem(item, candidates);
    if (matches && matches.length) {
      const matchedIds = matches.map((m) => m.item._id);
      item.matchedWith = matchedIds;
      item.owner = req.user;
      await item.save();
      await Promise.all(matches.map((m) => Item.findByIdAndUpdate(m.item._id, { $addToSet: { matchedWith: item._id } })));
      matches.forEach((m) => {
        let lostItem = item;
        let foundItem = m.item;
        notify.notifyMatch({ toItem: lostItem, matchedItem: foundItem, score: m.score }).catch((e) => console.error("Notify error:", e));
      });
    }
  } else {
    // A found item is pending, so just send a notification to the finder.
    // The matching will only happen after admin approval.
    console.log(`Simulating 'Submit for Verification' email to ${req.user.email}`);
    // You can add a real email function in notify.js if you want.
    // notify.requestItemSubmission(req.user, item);
    notify.notifyFinderToSubmitItem({ user: req.user, item }).catch(e => console.error("Email sending error:", e));
  }

  res.status(201).json(item);
});

// --- NEW FUNCTION for Admins ---
export const getPendingItems = asyncHandler(async (req, res) => {
    const items = await Item.find({ type: 'found', verificationStatus: 'pending' })
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });
    res.json(items);
});

// --- NEW FUNCTION for Admins ---
export const approveFoundItem = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (!item || item.type !== 'found') {
        res.status(404);
        throw new Error('Found item not found');
    }

    item.verificationStatus = 'verified';
    await item.save();

    // --- START OF FIX ---
    // We now populate the owner's email to ensure notifications are sent correctly.
    const candidates = await Item.find({ type: 'lost', status: 'active', verificationStatus: 'verified' }).populate('owner', 'name email');
    // --- END OF FIX ---
    const matches = matcher.matchItem(item, candidates);

    if (matches && matches.length) {
        const matchedIds = matches.map((m) => m.item._id);
        item.matchedWith = matchedIds;
        await item.save();
        await Promise.all(matches.map((m) => Item.findByIdAndUpdate(m.item._id, { $addToSet: { matchedWith: item._id } })));
        matches.forEach((m) => {
            let lostItem = m.item;
            let foundItem = item;
            notify.notifyMatch({ toItem: lostItem, matchedItem: foundItem, score: m.score }).catch((e) => console.error("Notify error:", e));
        });
    }

    res.json({ message: 'Item approved successfully', item });
});


export const getMyItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
});

// --- MODIFIED to only match against verified items ---
export const getItemMatches = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).populate("owner", "name email");
  if (!item) { res.status(404); throw new Error("Item not found"); }

  const candidates = await Item.find({ 
    type: item.type === "lost" ? "found" : "lost", 
    status: 'active',
    verificationStatus: 'verified' // Important
  });

  const matchesRaw = await Item.find({ _id: { $in: item.matchedWith }, verificationStatus: 'verified' }).populate("owner", "name email");
  
  const matchScores = matcher.matchItem(item, candidates);
  const scoreMap = new Map(matchScores.map(m => [m.item._id.toString(), m.score]));
  
  const matches = matchesRaw.map(m => ({ item: m, score: scoreMap.get(m._id.toString()) || 0 })).sort((a, b) => b.score - a.score);
  
  res.json({ lostItem: item, matches });
});

// REPLACE the existing getAllItemsForAdmin function with this one

export const getAllItemsForAdmin = asyncHandler(async (req, res) => {
  // This now correctly fetches ALL items for a complete admin view.
  const items = await Item.find({}).populate("owner", "name email").sort({ createdAt: -1 });
  res.json(items);
});

export const getLostItemsWithMatchesForAdmin = asyncHandler(async (req, res) => {
    const query = {
        type: "lost",
        matchedWith: { $exists: true, $ne: [] },
        $or: [ { status: "active" }, { status: { $exists: false } } ]
    };
    const items = await Item.find(query).populate("owner", "name email");
    const result = items.map(item => ({ item, matchCount: item.matchedWith.length }));
    res.json(result);
});

export const markMatchAsConfirmed = asyncHandler(async (req, res) => {
    // This is a placeholder, actual logic would be more complex
    res.json({ success: true });
});

export const getAllItems = asyncHandler(async (req, res) => {
    const { type, search, category } = req.query;
    const conditions = [];
    if (type) conditions.push({ type });
    if (category && category !== 'all') conditions.push({ category });
    if (search) {
        const regex = new RegExp(search, 'i');
        conditions.push({ $or: [ { title: regex }, { description: regex }, { location: regex }, { category: regex } ] });
    }
    const query = conditions.length ? { $and: conditions } : {};
    const items = await Item.find(query).populate("owner", "name email").sort({ createdAt: -1 });
    res.json(items);
});

// --- MODIFIED to only show verified items in public/match views ---
export const getAllItemsFilteredByType = async (type, searchTerm = '', category = '') => {
  const query = { type, verificationStatus: 'verified' }; // Only show verified items
  if (category && category !== 'all') query.category = category;
  if (searchTerm) {
    const regex = new RegExp(searchTerm, 'i');
    query.$or = [ { title: regex }, { description: regex }, { location: regex }, { category: regex } ];
  }
  return await Item.find(query).populate("owner", "name email").sort({ createdAt: -1 });
};

export const updateItemStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status || !['active', 'resolved'].includes(status)) { res.status(400); throw new Error("Invalid status"); }
  const item = await Item.findById(id);
  if (!item) { res.status(404); throw new Error("Item not found"); }
  if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') { res.status(403); throw new Error("Not authorized"); }
  item.status = status;
  await item.save();
  res.json(item);
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await Item.findById(id);
  if (!item) { res.status(404); throw new Error('Item not found'); }
  if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorized'); }
  await Item.deleteOne({ _id: id });
  res.json({ message: 'Item removed' });
});