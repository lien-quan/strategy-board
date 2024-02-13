import Layout from "../app/page";
import * as XLSX from "xlsx";
import { useState, useEffect } from "react";

export default function HeroComparison() {
  const [heroes, setHeroes] = useState({});
  const [firstHero, setFirstHero] = useState("");
  const [secondHero, setSecondHero] = useState("");
  const [firstHeroLevel, setFirstHeroLevel] = useState(1);
  const [secondHeroLevel, setSecondHeroLevel] = useState(1);

  // Load heroes data from local storage when the component mounts
  useEffect(() => {
    const storedHeroes = localStorage.getItem("heroes");
    if (storedHeroes) {
      // setHeroes(JSON.parse(storedHeroes));
      const parsedHeroes = JSON.parse(storedHeroes);
      setHeroes(parsedHeroes);
      const heroKeys = Object.keys(parsedHeroes);
      if (heroKeys.length >= 1) {
        setFirstHero(heroKeys[0]);
        if (heroKeys.length >= 2) {
          setSecondHero(heroKeys[1]);
        }
      }
    }
  }, []);

  // Save heroes data to local storage
  useEffect(() => {
    localStorage.setItem("heroes", JSON.stringify(heroes));
  }, [heroes]);

  // Function to translate the phrase based on the number of character configurations
  const getCharacterSettingPhrase = (count) => {
    // Check if count is 1 for correct singular or plural form
    const characterString = count === 1 ? "character" : "characters";
    return `${count} ${characterString} configuration${
      count === 1 ? "" : "s"
    } set`;
  };

  const calculateStatValue = (initialValue, increaseValue, heroLevel) => {
    const initial = parseInt(initialValue, 10);
    const increase = parseInt(increaseValue, 10);
    const level = parseInt(heroLevel, 10);
    return initial + increase * (level - 1);
  };

  const renderLevelOptions = () => {
    let options = [];
    for (let i = 1; i <= 15; i++) {
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return options;
  };

  const compareValues = (firstValue, secondValue) => {
    const diff = Math.abs(firstValue - secondValue);
    if (firstValue > secondValue) {
      return { first: `(${String.fromCharCode(9650)}${diff})`, second: "" };
    } else if (secondValue > firstValue) {
      return { first: "", second: `(${String.fromCharCode(9650)}${diff})` };
    }
    return { first: "", second: "" }; // No difference
  };

  // This function will render the table rows with the hero stats
  const renderHeroStats = (firstHeroStats, secondHeroStats) => {
    // Get all unique stat names from both heroes
    const allStats = [
      ...new Set([
        ...Object.keys(firstHeroStats || {}),
        ...Object.keys(secondHeroStats || {}),
      ]),
    ];

    return allStats.map((statName) => {
      const firstInitialValue = firstHeroStats?.[statName]?.initialValue || 0;
      const firstIncreaseValue = firstHeroStats?.[statName]?.increaseValue || 0;
      const secondInitialValue = secondHeroStats?.[statName]?.initialValue || 0;
      const secondIncreaseValue =
        secondHeroStats?.[statName]?.increaseValue || 0;

      // Calculate stat values based on hero levels
      const firstValue = calculateStatValue(
        firstInitialValue,
        firstIncreaseValue,
        firstHeroLevel
      );
      const secondValue = calculateStatValue(
        secondInitialValue,
        secondIncreaseValue,
        secondHeroLevel
      );

      const { first: firstDiff, second: secondDiff } = compareValues(
        firstValue,
        secondValue
      );

      return (
        <tr key={statName}>
          <td className="px-5 py-1 border-b border-gray-200 bg-white text-sm">
            {statName}
          </td>
          <td className="px-5 py-1 border-b border-gray-200 bg-white text-sm">
            {firstValue}
            {firstDiff}
          </td>
          <td className="px-5 py-1 border-b border-gray-200 bg-white text-sm">
            {secondValue}
            {secondDiff}
          </td>
        </tr>
      );
    });
  };

  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetsData = {};

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headers = sheetData[0];
        const rows = sheetData.slice(1);

        sheetsData[sheetName] = rows.reduce((acc, row) => {
          const statName = row[0];
          acc[statName] = {
            initialValue: row[1],
            increaseValue: row[2],
          };
          return acc;
        }, {});
      });

      setHeroes(sheetsData);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Layout>
      <div className="bg-white shadow h-screen">
        <div className="py-4 px-4">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleImportExcel}
          />
          <span>{getCharacterSettingPhrase(Object.keys(heroes).length)}</span>
        </div>
        {/* Dropdown for selecting the first hero */}
        <main className="container mx-auto my-1">
          <div className="bg-white p-6 rounded shadow flex justify-between space-x-4">
            <div className="flex-1 mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="first-hero-select"
              >
                First Hero:{" "}
              </label>
              <select
                id="first-hero-select"
                className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                value={firstHero}
                onChange={(e) => setFirstHero(e.target.value)}
                disabled={Object.keys(heroes).length === 0}
              >
                <option value="">Select a Hero</option>
                {Object.keys(heroes).map((hero) => (
                  <option key={hero} value={hero}>
                    {hero}
                  </option>
                ))}
              </select>
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="first-hero-level"
              >
                Level:{" "}
              </label>
              <select
                id="first-hero-level"
                className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                value={firstHeroLevel}
                onChange={(e) => setFirstHeroLevel(Number(e.target.value))}
              >
                {renderLevelOptions()}
              </select>
            </div>
            <div className="flex-1 mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="second-hero-select"
              >
                Second Hero:{" "}
              </label>
              <select
                id="second-hero-select"
                className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                value={secondHero}
                onChange={(e) => setSecondHero(e.target.value)}
                disabled={Object.keys(heroes).length === 0}
              >
                <option value="">Select a Hero</option>
                {Object.keys(heroes).map((hero) => (
                  <option key={hero} value={hero}>
                    {hero}
                  </option>
                ))}
              </select>
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="second-hero-level"
              >
                Level:{" "}
              </label>
              <select
                id="second-hero-level"
                className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                value={secondHeroLevel}
                onChange={(e) => setSecondHeroLevel(Number(e.target.value))}
              >
                {renderLevelOptions()}
              </select>
            </div>
          </div>
        </main>
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Stat Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {firstHero}
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {secondHero}
              </th>
            </tr>
          </thead>
          <tbody>
            {firstHero &&
              secondHero &&
              renderHeroStats(heroes[firstHero], heroes[secondHero])}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
