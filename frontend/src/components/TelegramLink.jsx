import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram, faTelegramPlane } from '@fortawesome/free-brands-svg-icons';
import { faCheck, faLink, faUnlink, faCopy, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import './TelegramLink.css';

/**
 * Telegram Account Linking Component
 * Allows users to link/unlink their Telegram account for bot notifications
 */
const TelegramLink = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if user has telegram linked
    if (user?.telegram_chat_id) {
      setLinked(true);
      setTelegramUsername(user.telegram_username || '');
    }
  }, [user]);

  const handleLink = async () => {
    setShowInstructions(true);
  };

  const handleUnlink = async () => {
    if (!window.confirm('Are you sure you want to unlink Telegram? You will no longer receive notifications.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/telegram/unlink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setLinked(false);
        setTelegramUsername('');
        if (onUpdate) onUpdate();
      } else {
        alert('Failed to unlink Telegram. Please try again.');
      }
    } catch (error) {
      console.error('Error unlinking Telegram:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyBotLink = () => {
    const botLink = 'https://t.me/PawsitiveBot'; // Update with your actual bot username
    navigator.clipboard.writeText(botLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openTelegram = () => {
    window.open('https://t.me/PawsitiveBot', '_blank'); // Update with your bot
  };

  return (
    <div className="telegram-link-container">
      <div className="telegram-link-header">
        <FontAwesomeIcon icon={faTelegram} className="telegram-icon" />
        <div className="telegram-link-info">
          <h3>Telegram Notifications</h3>
          <p className="telegram-link-description">
            Get instant notifications and manage your bookings via Telegram
          </p>
        </div>
        <div className="telegram-link-status">
          {linked ? (
            <span className="status-badge linked">
              <FontAwesomeIcon icon={faCheck} /> Linked
            </span>
          ) : (
            <span className="status-badge not-linked">Not Linked</span>
          )}
        </div>
      </div>

      {linked ? (
        <div className="telegram-linked-content">
          <div className="telegram-user-info">
            <FontAwesomeIcon icon={faTelegramPlane} className="telegram-user-icon" />
            <div className="telegram-user-details">
              <p className="telegram-username">
                {telegramUsername ? `@${telegramUsername}` : 'Telegram Connected'}
              </p>
              <p className="telegram-linked-date">
                Linked on {new Date(user.telegram_linked_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="telegram-actions">
            <button 
              className="btn btn-telegram-primary"
              onClick={openTelegram}
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              Open Telegram
            </button>
            <button 
              className="btn btn-telegram-danger"
              onClick={handleUnlink}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faUnlink} />
              {loading ? 'Unlinking...' : 'Unlink'}
            </button>
          </div>

          <div className="telegram-benefits">
            <h4>You can now:</h4>
            <ul>
              <li>🏨 Book hotel stays via chat</li>
              <li>📅 Check appointments instantly</li>
              <li>🔔 Receive booking notifications</li>
              <li>🐾 View your pet information</li>
              <li>💬 Chat naturally with AI assistant</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="telegram-not-linked-content">
          {!showInstructions ? (
            <div className="telegram-link-prompt">
              <p>Link your Telegram to receive notifications and manage bookings on-the-go!</p>
              <button 
                className="btn btn-telegram-primary btn-large"
                onClick={handleLink}
              >
                <FontAwesomeIcon icon={faLink} />
                Link Telegram Account
              </button>
            </div>
          ) : (
            <div className="telegram-instructions">
              <h4>How to Link:</h4>
              <ol className="telegram-steps">
                <li>
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <p>Open Telegram and search for <strong>@PawsitiveBot</strong></p>
                    <button 
                      className="btn btn-copy"
                      onClick={copyBotLink}
                    >
                      <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </li>
                <li>
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <p>Click "Start" or send <code>/start</code></p>
                  </div>
                </li>
                <li>
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <p>Use the login link sent by the bot</p>
                  </div>
                </li>
              </ol>

              <div className="telegram-instruction-actions">
                <button 
                  className="btn btn-telegram-primary"
                  onClick={openTelegram}
                >
                  <FontAwesomeIcon icon={faTelegramPlane} />
                  Open Telegram
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowInstructions(false)}
                >
                  Cancel
                </button>
              </div>

              <div className="telegram-note">
                <p>
                  <strong>Note:</strong> Make sure you're logged into this account 
                  in your browser when you click the link from Telegram.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TelegramLink;
