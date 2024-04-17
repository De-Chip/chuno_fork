import { useState, useRef, useEffect } from 'react';
import useCustomAxios from '../hook/useCustomAxios.mjs';
import styles from './youtube.module.css';
import ReactPlayer from 'react-player/youtube';
import SearchResult from './SearchResult';
import Playlist from './playlist';

// const API_KEY_1 = import.meta.env.VITE_YOUTUBE_API_1;
// const API_KEY_2 = import.meta.env.VITE_YOUTUBE_API_2;
// const API_KEY_3 = import.meta.env.VITE_YOUTUBE_API_3;
// const API_KEY_4 = import.meta.env.VITE_YOUTUBE_API_4;

// const API_KEYS = [API_KEY_1, API_KEY_2, API_KEY_3, API_KEY_4];
const API_KEYS = import.meta.env.VITE_YOUTUBE_API.split(',');

const MAX_API_KEYS = API_KEYS.length;

function YoutubeSearch() {
  const axiosInstance = useCustomAxios();
  const playerRef = useRef(null);

  const [currentKeyIndex, setCurrentKeyIndex] = useState(0); // 현재 사용 중인 API 키 인덱스

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5); // 초기 볼륨은 0.5로 설정
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const player = playerRef.current?.getInternalPlayer();
    if (player) {
      player.setVolume(volume * 100);
    }
  }, [volume]);

  const selectNextKey = () => {
    setCurrentKeyIndex(prevIndex => (prevIndex + 1) % MAX_API_KEYS);
  };

  const searchYoutube = async () => {
    try {
      const response = await axiosInstance.get(
        `https://www.googleapis.com/youtube/v3/search?key=${API_KEYS[currentKeyIndex]}&part=snippet&q=${searchTerm}&maxResults=5&type=video`,
      );
      setSearchResult(response.data.items);
    } catch (error) {
      console.error('Error searching YouTube:', error);
      // 에러가 발생하면서 상태 코드가 403인 경우에는 할당량이 다 쓰였다고 판단하고 다음 키로 전환
      //
      if (error.response && error.response.status === 403) {
        selectNextKey();
      }
    }
  };

  const handleInputChange = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearchKeyPress = event => {
    if (event.key === 'Enter') {
      searchYoutube();
    }
  };

  const handleSearchClick = () => {
    searchYoutube();
  };

  const handleAddButtonClick = (videoId, videoTitle) => {
    const newVideo = { id: videoId, title: videoTitle };
    setSelectedVideos([...selectedVideos, newVideo]);
    if (selectedVideos.length === 0) {
      setCurrentVideoIndex(0);
    }
  };

  const handleVideoItemClick = (videoId, index) => {
    setCurrentVideoIndex(index);
  };

  const handleDeleteButtonClick = videoId => {
    setSelectedVideos(selectedVideos.filter(video => video.id !== videoId));
    if (selectedVideos[currentVideoIndex]?.id === videoId) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handlePrevClick = () => {
    setCurrentVideoIndex(prev =>
      prev === 0 ? selectedVideos.length - 1 : prev - 1,
    );
  };

  const handleNextClick = () => {
    setCurrentVideoIndex(prev =>
      prev === selectedVideos.length - 1 ? 0 : prev + 1,
    );
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = e => {
    setVolume(parseFloat(e.target.value));
  };

  const handleSeekChange = e => {
    const seekTo = parseFloat(e.target.value);
    playerRef.current.seekTo(seekTo, 'seconds'); // 시간을 옮겨준다?
  };

  const handleProgress = state => {
    setPlayedSeconds(state.playedSeconds);
    setDuration(state.loadedSeconds);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.searchbar}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleSearchKeyPress} // onKeyPress -> onKeyDown으로 변경
        />
        <button onClick={handleSearchClick}>Search</button>
      </div>

      <SearchResult
        searchResult={searchResult}
        handleAddButtonClick={handleAddButtonClick}
      />

      <Playlist
        selectedVideos={selectedVideos}
        handleDeleteButtonClick={handleDeleteButtonClick}
        handleVideoItemClick={handleVideoItemClick}
        handlePrevClick={handlePrevClick}
        handleNextClick={handleNextClick}
      />

      {selectedVideos.length > 0 && (
        <div className={styles.addedvideo}>
          <div className="player-wrapper">
            <ReactPlayer
              ref={playerRef}
              className="react-player"
              playing={isPlaying}
              url={`https://youtube.com/embed/${selectedVideos[currentVideoIndex]?.id}`}
              width="0"
              height="0"
              controls={false}
              onProgress={handleProgress}
            />
          </div>
          <div className={styles.controls}>
            <button onClick={handlePlayPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={volume}
              onChange={handleVolumeChange}
            />
            <input
              type="range"
              min={0}
              max={duration}
              step="any"
              value={playedSeconds}
              onChange={handleSeekChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default YoutubeSearch;
