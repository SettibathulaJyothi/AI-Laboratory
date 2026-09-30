## Train Test Split
In Artificial Intelligence (AI), Machine Learning (ML), and Deep Learning (DL), a train-test split is a data preprocessing technique used to evaluate the performance of a model. It involves splitting your single dataset into two separate subsets: one to train the model and another to test its accuracy.  
## The Two Components
+ Training Set: The larger portion of your data (typically 70% to 80%). The AI model uses this data to learn patterns, weights, and relationships.  
+ Testing Set: The remaining portion of your data (typically 20% to 30%). This data is kept hidden from the model during training. It acts as a final exam to see how well the model performs on new, unseen information.  
## Need of this
+ The primary reason for a train-test split is to detect and prevent overfitting.
+ Overfitting happens when a model learns the training data too well—memorizing the noise and specific details instead of the general patterns.
+ If you evaluate a model using the same data it trained on, it might score 100% accuracy but fail completely in the real world. A separate test set gives you an honest, unbiased measure of how the model will perform in production.

