import { ip } from 'main/global';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';

type Delay = number | null;
type TimerHandler = (...args: any[]) => void;
const useInterval = (callback: TimerHandler, delay: Delay) => {
  const savedCallbackRef = useRef<TimerHandler>();

  useEffect(() => {
    savedCallbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (...args: any[]) => savedCallbackRef.current!(...args);

    if (delay !== null) {
      const intervalId = setInterval(handler, delay);
      return () => clearInterval(intervalId);
    }
  }, [delay]);
};

export default function useFetch() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loopSleepTime, setLoopSleepTime] = useState(1000);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  async function fetchData(url: string) {
    let res;
    try {
      if (!ip) {
        setLoading(true);
        setData(null);
        setLoopSleepTime(1000);
        return;
      }
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 1000);
      res = await fetch(`http://${ip}/${url}`, {
        signal: controller.signal,
      });
      if (res.status !== 200) {
        setLoading(true);
        setData(null);
        setLoopSleepTime(1000);
        await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
        return;
      }

      const contentType = res.headers.get('Content-Type');
      if (contentType === 'application/json') {
        const jsonData = await res.json();
        const formatedData = jsonData.map((data) => {
          return {
            name: data.name,
            unixtime: new Date(data.mtime).valueOf() / 1000,
            mtime: data.mtime,
            size: data.size,
            type: data.type,
          };
        });
        setData(formatedData);
        console.log(formatedData);
      } else {
        const fileName = searchParams
          .get('hash')!
          .split('/')
          .slice(-1)
          .join('/');
        console.log('fileName', fileName);
        const blob = await res.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([blob]));
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        navigate(
          `/volume?hash=${searchParams
            .get('hash')!
            .split('/')
            .slice(0, -1)
            .join('/')}`,
          {
            replace: true,
          }
        );
      }

      console.log('setLoopSleepTime');
      setLoopSleepTime(null);
      setLoading(false);
    } catch (err) {
      setLoading(true);
      setData(null);
      setLoopSleepTime(1000);
      console.log('err:::::::', err.message);
      await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
    }
  }

  const fetchDataCallback = useCallback(() => {
    fetchData(searchParams.get('hash'));
  }, [searchParams]);

  useInterval(() => {
    console.log('setCount');
    fetchDataCallback();
  }, loopSleepTime);

  useEffect(() => {
    fetchDataCallback();
  }, [fetchDataCallback, searchParams]);

  return { data, error, loading };
}
