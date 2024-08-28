from flask import Flask, render_template, request, jsonify
import tweepy
from textblob import TextBlob

# Twitter API credentials
consumer_key = 'cmSIRNIITrsbc0jmAQgc9YeQt'
consumer_secret = 'hloENW4rgQOs99IHCnxcVeuBP3DS2uHyTkdIlnG2yErqX5Xbe9'
access_token = '1784656703994351616-CJjtAFesKPYtPBGNOzm3mZXPXr36nI'
access_token_secret = '3SwD7F64voKHAiWSR21jLgfyNFxICssqP75fLjuwPvxrR'

# Setting up Tweepy for Twitter API v1.1
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)
api = tweepy.API(auth, wait_on_rate_limit=True)

# Flask app initialization
app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/search", methods=["POST"])
def search():
    search_query = request.form.get("search_query")
    if not search_query:
        return jsonify({"error": "No search query provided"}), 400

    try:
        # Using Twitter API v1.1 to search tweets
        tweets = api.search(q=search_query, count=10, tweet_mode='extended')
        tweet_texts = [tweet.full_text for tweet in tweets]
        return jsonify({"tweets": tweet_texts})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/analyze_tweet", methods=["POST"])
def analyze_tweet():
    tweet_text = request.form.get("tweet_text")
    if not tweet_text:
        return jsonify({"error": "No tweet text provided"}), 400

    try:
        # Analyze sentiment using TextBlob
        blob = TextBlob(tweet_text)
        sentiment_polarity = blob.sentiment.polarity
        sentiment_subjectivity = blob.sentiment.subjectivity
        if sentiment_polarity > 0:
            sentiment = "Positive"
        elif sentiment_polarity < 0:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
        return jsonify({"success": True, "sentiment": sentiment, "polarity": sentiment_polarity, "subjectivity": sentiment_subjectivity})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)