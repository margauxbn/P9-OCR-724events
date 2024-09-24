import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo, // Import du hook useMemo
} from "react";

const DataContext = createContext({});

export const api = {
  loadData: async () => {
    const json = await fetch("/events.json");
    return json.json();
  },
};

export const DataProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [last, setLast] = useState(null); // État pour stocker l'événement "last"

  const getData = useCallback(async () => {
    try {
      const result = await api.loadData();
      setData(result);

      // Supposons que "events" est un tableau trié par date descendante dans le JSON
      if (result && result.events && result.events.length > 0) {
        const lastEvent = result.events.reduce((latest, currentEvent) => {
          const currentDate = new Date(currentEvent.date);
          return currentDate > new Date(latest.date) ? currentEvent : latest;
        }, result.events[0]);

        setLast(lastEvent); // Met à jour le dernier événement
      }

    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    if (data) return;
    getData();
  }, [data, getData]);

  // Utilisation de useMemo pour mémoriser l'objet value
  const value = useMemo(() => ({
    data,
    last,
    error,
  }), [data, last, error]); // Mémorisation des dépendances

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useData = () => useContext(DataContext);

export default DataContext;
