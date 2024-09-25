import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
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
  const [last, setLast] = useState(null); 

  const getData = useCallback(async () => {
    try {
      const result = await api.loadData();
      setData(result);

      if (result && result.events && result.events.length > 0) {
        const lastEvent = result.events.reduce((latest, currentEvent) => {
          const currentDate = new Date(currentEvent.date);
          return currentDate > new Date(latest.date) ? currentEvent : latest;
        }, result.events[0]);

        setLast(lastEvent);
      }

    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    if (data) return;
    getData();
  }, [data, getData]);

  const value = useMemo(() => ({
    data,
    last,
    error,
  }), [data, last, error]);

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
