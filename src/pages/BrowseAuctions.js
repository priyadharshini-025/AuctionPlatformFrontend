import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { auctionAPI, categoryAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import LoadingSpinner from '../components/LoadingSpinner';

function BrowseAuctions() {
    const location = useLocation();
    const [auctions, setAuctions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        category: 'all',
    });

    useEffect(() => {
        fetchData();
    }, [location]); // Refetch when location changes (navigation)

    const fetchData = async () => {
        try {
            const [auctionsRes, categoriesRes] = await Promise.all([
                auctionAPI.getAll(),
                categoryAPI.getAll(),
            ]);
            setAuctions(auctionsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredAuctions = auctions
        .filter((auction) => {
            // Status filter
            if (filters.status !== 'all' && auction.status !== filters.status) {
                return false;
            }

            // Category filter (FIXED)
            if (filters.category !== 'all') {
                const categoryId =
                    typeof auction.category === 'object'
                        ? auction.category._id
                        : auction.category;

                if (categoryId !== filters.category) {
                    return false;
                }
            }

            return true;
        })
        .sort((a, b) => {
            // Sort by status: active first, then upcoming, then ended
            const statusOrder = { active: 0, upcoming: 1, ended: 2 };
            const aOrder = statusOrder[a.status] ?? 3;
            const bOrder = statusOrder[b.status] ?? 3;
            return aOrder - bOrder;
        });
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">Browse Auctions</h1>
                    <p className="text-gray-600 text-lg">Active auctions first, followed by upcoming and ended auctions</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 relative z-10"
                            >
                                <option value="all" style={{ fontWeight: 'bold' }}>All</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="active">Active</option>
                                <option value="ended">Ended</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Category</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 relative z-10"
                            >
                                <option value="all"><strong>All Categories</strong></option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <button
                                onClick={() => setFilters({ status: 'all', category: 'all' })}
                                className="w-full bg-gray-400 text-white py-2 rounded-lg font-bold hover:bg-gray-500 mt-6"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Auctions Grid */}
                {loading ? (
                    <LoadingSpinner size="lg" />
                ) : filteredAuctions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAuctions.map((auction) => (
                            <AuctionCard key={auction._id} auction={auction} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 text-xl py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        No auctions found matching your criteria
                    </div>
                )}
            </div>
        </div>
    );
}

export default BrowseAuctions;
