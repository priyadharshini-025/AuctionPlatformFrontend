import React from 'react';
import { Link } from 'react-router-dom';

function AuctionCard({ auction }) {
  const now = new Date();
  const timeLeft = new Date(auction.endTime) - now;
  
  const formatTimeLeft = (timeLeftMs) => {
    if (timeLeftMs <= 0) return 'Ended';
    
    const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    if (minutes > 0) return `${minutes}m left`;
    return 'Soon';
  };
  
  const timeLeftText = formatTimeLeft(timeLeft);
  
  const computedStatus = new Date(auction.endTime) <= now
    ? 'ended'
    : new Date(auction.startTime) > now
      ? 'upcoming'
      : auction.status;
  
  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Active', color: 'bg-green-100 text-green-800' },
      ended: { text: 'Ended', color: 'bg-red-100 text-red-800' },
      upcoming: { text: 'Upcoming', color: 'bg-blue-100 text-blue-800' },
      sold: { text: 'Sold', color: 'bg-purple-100 text-purple-800' },
      unsold: { text: 'Unsold', color: 'bg-gray-100 text-gray-800' },
      partially_sold: { text: 'Partially Sold', color: 'bg-yellow-100 text-yellow-800' },
    };
    return badges[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  const statusBadge = getStatusBadge(computedStatus);

  const currentBid = auction.bids.length > 0
    ? (auction.auctionType === 'reverse' 
        ? Math.min(...auction.bids.map((b) => b.amount))
        : Math.max(...auction.bids.map((b) => b.amount)))
    : auction.product?.startingPrice || 0;

  const isSealedAuction = auction.auctionType === 'sealed';

//   const imageBaseUrl = process.env.REACT_APP_API_URL || window.location.origin;
//   console.log("auction.images ",auction.images,auction.images[0],auction.images[0].startsWith('http'))
//   const imageSrc = auction.images && auction.images.length > 0
//     ? auction.images[0].startsWith('http')
//       ? auction.images[0]
//       : `${imageBaseUrl}${auction.images[0]}`
    // : null;

    const imageBaseUrl = (process.env.REACT_APP_API_URL || window.location.origin).replace('/api', '');
  
    const imageSrc = auction.images?.length
      ? auction.images[0].startsWith('http')
        ? auction.images[0]  // Cloudinary URL - use as is
        : `${imageBaseUrl.replace(/\/$/, '')}${auction.images[0]}`  // Local URL - construct full path
      : null;
    
    console.log("AuctionCard - auction.images:", auction.images, "imageSrc:", imageSrc);
  return (
    <Link to={`/auction/${auction._id}`}>
      <div className="bg-white rounded-lg shadow card-hover p-4">
        <div className="bg-gray-200 h-48 rounded mb-4 flex items-center justify-center overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={auction.product?.name || 'Product'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>
        <h3 className="text-lg font-bold mb-2 flex items-center justify-between">
          {auction.product?.name || 'N/A'}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
            {statusBadge.text}
          </span>
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{auction.product?.description || 'N/A'}</p>
        
        <div className="mb-3 space-y-2">
          <p className="text-gray-700">
            <span className="font-semibold">Current Bid:</span> {isSealedAuction ? 'Sealed' : `$${currentBid}`}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">{auction.auctionType === 'reverse' ? 'Max Budget' : 'Minimum Bid'}:</span> ${auction.product?.startingPrice || 0}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Auction Type:</span> {auction.auctionType}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Seller Rating:</span> ⭐ {auction.seller?.rating ? `${auction.seller.rating.toFixed(1)} (${auction.seller.totalReviews})` : 'N/A'}
          </p>
        </div>

        <div className="flex justify-end items-center">
          <span className={`text-sm font-bold ${timeLeft > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {timeLeftText}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default AuctionCard;
