"use client";

import React, { useEffect, useState } from "react";

interface TableStat {
    table: string;
    count: number;
}

const DatabaseStats: React.FC = () => {
    const [stats, setStats] = useState<TableStat[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // useEffect(() => {
    //     const fetchStats = async () => {
    //         try {
    //             const response = await fetch("/api/stats");
    //             if (!response.ok) {
    //                 throw new Error("Failed to fetch database stats");
    //             }
    //             const data = await response.json();
    //             setStats(data.stats);
    //         } catch (err) {
    //             setError(err instanceof Error ? err.message : "Unknown error");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchStats();
    // }, []);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/stats", {
                    headers: {
                        "x-api-secret": process.env.NEXT_PUBLIC_API_SECRET || "", // Убедитесь, что NEXT_PUBLIC_ используется для клиента
                    },
                });
    
                if (!response.ok) {
                    throw new Error("Failed to fetch database stats");
                }
    
                const data = await response.json();
                setStats(data.stats);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };
    
        fetchStats();
    }, []);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="text-white text-lg font-semibold">Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="text-red-500 text-lg font-semibold">Error: {error}</span>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <h2 className="text-2xl font-bold mb-6 text-center">Database Statistics</h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Table Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Record Count
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats?.map((stat, index) => (
                            <tr key={index} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700 transition-colors duration-300">
                                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                    {/* {stat.table} */} DSCAN
                                </td>
                                <td className="px-6 py-4 text-gray-400">
                                    {stat.count}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DatabaseStats;