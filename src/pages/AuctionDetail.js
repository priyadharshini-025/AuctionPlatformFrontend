import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionAPI, bidAPI, reviewAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function AuctionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [now, setNow] = useState(new Date());

  const fetchAuctionDetails = useCallback(async () => {
    try {
      const [auctionRes, bidsRes] = await Promise.all([
        auctionAPI.getById(id),
        bidAPI.getAuctionBids(id),
      ]);
      setAuction(auctionRes.data);
      setBids(bidsRes.data);
    } catch (err) {
      setError('Error fetching auction details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAuctionDetails();
  }, [fetchAuctionDetails]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    const amount = parseFloat(bidAmount);
    const currentCompareBid = bids.length > 0
      ? (auction.auctionType === 'reverse'
          ? Math.min(...bids.map((b) => b.amount))
          : Math.max(...bids.map((b) => b.amount)))
      : auction.product.startingPrice;
    const startingBid = auction.product.startingPrice;

    if (auction.auctionType === 'reverse') {
      if (amount >= currentCompareBid) {
        setError(`Max budget is $${currentCompareBid}. Please bid lower than this amount.`);
        return;
      }
    } else if (auction.auctionType === 'sealed') {
      if (amount < startingBid) {
        setError(`Bid must be at least the base price of $${startingBid}`);
        return;
      }
    } else {
      if (amount <= currentCompareBid) {
        setError(`Bid must be higher than $${currentCompareBid}`);
        return;
      }
    }

    setPlacing(true);
    setError('');

    try {
      const response = await bidAPI.placeBid({
        auctionId: id,
        amount,
      });
      setBidAmount('');
      fetchAuctionDetails();
      // Show success message
      alert(response.data.message || 'Bid placed successfully');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error placing bid');
    } finally {
      setPlacing(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setError('');

    try {
      await reviewAPI.create({
        auctionId: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      alert('Review submitted successfully!');
      setReviewComment('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!auction) {
    return <div className="text-center py-12">Auction not found</div>;
  }

  const currentBidValue = bids.length > 0
    ? (auction.auctionType === 'reverse'
        ? Math.min(...bids.map((b) => b.amount))
        : Math.max(...bids.map((b) => b.amount)))
    : auction.product.startingPrice;

  const currentBidLabel = auction.auctionType === 'reverse' ? 'Current Lowest Bid' : 'Current Highest Bid';

  // Find user's current bid
  const userCurrentBid = bids.find((bid) => {
    const bidderId = bid.bidder?._id || bid.bidder;
    return String(bidderId) === String(user?.id || user?._id);
  });

  const timeLeft = new Date(auction.endTime).getTime() - now.getTime();
  
  const formatTimeLeft = (timeLeftMs) => {
    if (timeLeftMs <= 0) return 'Ended';
    
    const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'Ending soon';
  };
  
  const timeLeftText = formatTimeLeft(timeLeft);
  const auctionEnded = new Date(auction.endTime).getTime() <= now.getTime();
  // const auctionStarted = new Date(auction.startTime).getTime() <= now.getTime();

  const inferredWinnerBid = (() => {
    if (!auctionEnded || bids.length === 0) return null;
    if (auction.winner || (auction.winners && auction.winners.length > 0)) return null;

    const sortedBids = [...bids].sort((a, b) => {
      if (auction.auctionType === 'reverse') {
        return a.amount - b.amount;
      }
      return b.amount - a.amount;
    });

    return sortedBids[0] || null;
  })();

  const effectiveWinner = auction.winner || auction.winners?.[0]?.bidder || inferredWinnerBid?.bidder || null;
  const effectiveWinningAmount = auction.finalPrice ?? auction.winners?.[0]?.amount ?? inferredWinnerBid?.amount ?? currentBidValue;
  const effectiveWinnerId = effectiveWinner?._id || effectiveWinner;
  const auctionHasWinner = Boolean(effectiveWinner);

  const computedStatus = auctionEnded
    ? auctionHasWinner
      ? auction.status === 'partially_sold' || auction.status === 'sold'
        ? auction.status
        : 'sold'
      : 'unsold'
    : new Date(auction.startTime).getTime() > now.getTime()
      ? 'upcoming'
      : 'active';

  const imageBaseUrl = process.env.REACT_APP_API_URL || window.location.origin;
  const selectedImageSrc = auction.images && auction.images.length > 0
    ? auction.images[currentImageIndex].startsWith('http')
      ? auction.images[currentImageIndex]
      : `${imageBaseUrl}${auction.images[currentImageIndex]}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center overflow-hidden relative">
              {selectedImageSrc ? (
                <>
                  <img
                    src={selectedImageSrc}
                    alt={`Product ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {auction.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((currentImageIndex - 1 + auction.images.length) % auction.images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-2 rounded hover:bg-opacity-75"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((currentImageIndex + 1) % auction.images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-2 rounded hover:bg-opacity-75"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                        {currentImageIndex + 1} / {auction.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <span className="text-gray-400 text-xl">No Images Available</span>
              )}
            </div>

            {/* Image Thumbnails */}
            {auction.images && auction.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {auction.images.map((img, idx) => {
                  const thumbnailUrl = img.startsWith('http') ? img : `${imageBaseUrl}${img}`;
                  return (
                    <img
                      key={idx}
                      src={thumbnailUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-full h-20 object-cover rounded cursor-pointer border-2 ${
                        currentImageIndex === idx ? 'border-blue-600' : 'border-gray-300'
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Auction Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold mb-4">{auction.product.name}</h1>
            <p className="text-gray-600 mb-6">{auction.product.description}</p>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="font-bold">{auction.auctionType === 'reverse' ? 'Max Budget' : 'Starting Price'}:</span>
                <span>${auction.product.startingPrice}</span>
              </div>
              {auction.auctionType !== 'sealed' && (
                <div className="flex justify-between">
                  <span className="font-bold">{currentBidLabel}:</span>
                  <span className="text-xl text-green-600 font-bold">${currentBidValue}</span>
                </div>
              )}
              {userCurrentBid && (
                <div className="flex justify-between">
                  <span className="font-bold">Your Current Bid:</span>
                  <span className="text-blue-600 font-bold">${userCurrentBid.amount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-bold">Number of Bids:</span>
                <span>
                  {auction.auctionType === 'sealed' ? 'Sealed' : bids.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Status:</span>
                <span className="capitalize">{computedStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Time Left:</span>
                <span className={timeLeft > 0 ? 'text-green-600' : 'text-red-600'}>
                  {timeLeftText}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Auction Type:</span>
                <span className="capitalize">{auction.auctionType}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {computedStatus === 'active' && (
              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    {userCurrentBid ? 'Update Your Bid Amount' : 'Your Bid Amount'}
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={
                      auction.auctionType === 'reverse'
                        ? `Bid lower than $${currentBidValue}`
                        : auction.auctionType === 'sealed'
                          ? 'Enter a higher sealed bid'
                          : `Minimum: $${currentBidValue + 1}`
                    }
                    min={auction.auctionType === 'reverse' ? '0.01' : auction.auctionType === 'sealed' ? auction.product.startingPrice + 1 : currentBidValue + 1}
                    max={auction.auctionType === 'reverse' ? Math.max(0, currentBidValue - 0.01) : undefined}
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={placing || !user}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {placing ? 'Placing Bid...' : userCurrentBid ? 'Update Bid' : 'Place Bid'}
                </button>
              </form>
            )}

            {computedStatus === 'upcoming' && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                This auction will start on {new Date(auction.startTime).toLocaleString()}
              </div>
            )}

            {(computedStatus === 'sold' || computedStatus === 'unsold' || computedStatus === 'partially_sold') && (
              <div className="bg-gray-100 text-gray-700 px-4 py-3 rounded mb-4">
                <div className="font-bold mb-2">Auction Results</div>
                {auctionHasWinner ? (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Winner:</span>
                      <span className="font-bold text-green-600">
                        {String(effectiveWinnerId) === String(user?.id || user?._id)
                          ? 'You won!'
                          : (effectiveWinner?.name || 'Winning bidder')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Winning Bid:</span>
                      <span className="font-bold">${effectiveWinningAmount}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600 font-bold">No winner - This auction ended without bids</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bid History */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Bid History</h2>
          {auction.auctionType === 'sealed' && !auctionEnded ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">This is a sealed auction</p>
              <p className="text-sm text-gray-500">
                Bid details will be revealed after the auction ends
              </p>
            </div>
          ) : bids.length > 0 ? (
            <div className="space-y-4">
              {bids.map((bid, idx) => {
                const bidBidderId = String(bid.bidder?._id || bid.bidder);
                const isWinnerBid = effectiveWinnerId && bidBidderId === String(effectiveWinnerId);
                return (
                  <div key={bid._id} className={`border-b pb-4 last:border-b-0 ${isWinnerBid ? 'bg-green-50 border-green-200' : ''}`}>
                    <div className="flex justify-between">
                      <span className="font-bold">{bid.bidder?.name || `Bidder ${idx + 1}`}</span>
                      <span>${bid.amount}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(bid.time).toLocaleString()}
                      {isWinnerBid && (
                        <span className="ml-2 text-green-600 font-bold">WINNER</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No bids placed yet</p>
          )}
        </div>

        {/* Review Section */}
        {(auctionEnded || computedStatus === 'sold' || computedStatus === 'partially_sold') && user && effectiveWinnerId && String(effectiveWinnerId) === String(user.id || user._id) && (
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Rate the Seller</h2>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  required
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Very Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Comment (Optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  placeholder="Share your experience with this seller..."
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuctionDetail;
