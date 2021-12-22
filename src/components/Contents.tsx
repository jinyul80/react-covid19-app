import axios from "axios";
import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, ArcElement, LineElement, Title, Tooltip, Legend);

const Contents = () => {
    const [confirmedData, setConfirmedData] = useState({
        labels: [""],
        datasets: [
            {
                label: "국내 누적 확인자",
                data: [0],
                backgroundColor: "salmon",
                fill: true,
            },
        ],
    });

    const [activeData, setActiveData] = useState({
        labels: [""],
        datasets: [
            {
                label: "월별 격리자 현황",
                data: [0],
                backgroundColor: "salmon",
                borderColor: "salmon",
            },
        ],
    });

    const [comparedData, setComparedData] = useState({
        labels: [""],
        datasets: [
            {
                label: "",
                data: [0],
                backgroundColor: [""],
                borderColor: [""],
            },
        ],
    });

    interface CovidSummaryInterface {
        year: number;
        month: number;
        date: number;
        confirmed: number;
        active: number;
        death: number;
        recovered: number;
    }

    useEffect(() => {
        const fetchEvents = async () => {
            const res = await axios.get("https://api.covid19api.com/total/dayone/country/kr");
            makeDate(res.data);
        };

        const makeDate = (items: [{ [key: string]: string | number }]) => {
            let acc: Array<CovidSummaryInterface> = [];

            items.forEach((cur) => {
                const currentDate = new Date(cur.Date);
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const date = currentDate.getDate();
                const confirmed = cur.Confirmed as number;
                const active = cur.Active as number;
                const death = cur.Deaths as number;
                const recovered = cur.Recovered as number;

                if (year === 2021 && month >= 8) {
                    return;
                }

                const findItem = acc.find((a) => a.year === year && a.month === month);

                if (!findItem) {
                    acc.push({ year, month, date, confirmed, active, death, recovered });
                } else if (findItem && findItem.date < date) {
                    findItem.date = date;
                    findItem.confirmed = confirmed;
                    findItem.active = active;
                    findItem.death = death;
                    findItem.recovered = recovered;
                }
            });

            console.log(acc);
            const labels: Array<string> = acc.map((a) => `${a.year}-${a.month}월`);

            setConfirmedData({
                labels,
                datasets: [
                    {
                        label: "국내 누적 확인자",
                        data: acc.map((a) => a.confirmed),
                        backgroundColor: "salmon",
                        fill: true,
                    },
                    {
                        label: "국내 누적 완치자",
                        data: acc.map((a) => a.recovered),
                        backgroundColor: "green",
                        fill: true,
                    },
                ],
            });

            setActiveData({
                labels,
                datasets: [
                    {
                        label: "월별 격리자 현황",
                        data: acc.map((a) => a.active),
                        backgroundColor: "salmon",
                        borderColor: "salmon",
                    },
                ],
            });

            const last = acc[acc.length - 1];
            setComparedData({
                labels: ["확진자", "격리해제", "사망"],
                datasets: [
                    {
                        label: "누적 확진, 해제, 사망 비율",
                        data: [last.confirmed, last.recovered, last.death],
                        backgroundColor: ["#ff3d67", "#059bff", "#ffc233"],
                        borderColor: ["#ff3d67", "#059bff", "#ffc233"],
                    },
                ],
            });
        };

        fetchEvents();
    }, []);

    return (
        <div>
            <h2>국내 코로나 현황</h2>
            <div className="contents">
                <div>
                    <Bar
                        data={confirmedData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: "bottom" as const,
                                },
                                title: {
                                    display: true,
                                    text: "누적 확진자 추이",
                                },
                            },
                        }}
                    />
                </div>
                <div>
                    <Line
                        data={activeData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: "bottom" as const,
                                },
                                title: {
                                    display: true,
                                    text: "월별 격리자 현황",
                                },
                            },
                        }}
                    />
                </div>
                <div>
                    <Doughnut
                        data={comparedData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: "top" as const,
                                },
                                title: {
                                    display: true,
                                    text: `누적 확진, 해제, 사망 (${new Date().getMonth() + 1}월)`,
                                },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Contents;
