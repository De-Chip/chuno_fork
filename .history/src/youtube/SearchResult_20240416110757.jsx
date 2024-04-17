import PropTypes from 'prop-types';
import styles from './youtube.module.css';

function SearchResult({ searchResult, handleAddButtonClick }) {
  const changechar = /[^\w\s]/gi;

  return (
    <ul className={styles.wrap_player}>
      {searchResult.map(item => (
        <li className={styles.playerlist} key={item.id.videoId}>
          <iframe
            width="100"
            height="140"
            src={`https://youtube.com/embed/${item.id.videoId}`}
          ></iframe>
          <h3 className={styles.listname}>
            {item.snippet.title.replace(changechar, '')}
          </h3>{' '}
          <button
            className={styles.playadd}
            onClick={() =>
              handleAddButtonClick(item.id.videoId, item.snippet.title)
            }
          >
            +
          </button>
        </li>
      ))}
    </ul>
  );
}

// props에 대한 유효성을 검사하는 PropTypes를 추가
SearchResult.propTypes = {
  searchResult: PropTypes.array.isRequired, // searchResult는 배열이며 필수
  handleAddButtonClick: PropTypes.func.isRequired, // handleAddButtonClick은 함수이며 필수
};

export default SearchResult;
