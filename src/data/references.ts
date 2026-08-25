import type { Referencia } from '../engine/types'

// Biblioteca de referências bibliográficas reais, selecionadas manualmente
// (trabalhos clássicos/fundacionais e/ou amplamente citados por técnica).
// Conforme a Seção 17 do prompt de especificação: nesta V1 não há busca
// automática na web — a arquitetura fica pronta para, em versão futura,
// substituir/complementar esta lista por resultados de busca em tempo real.
// Nenhuma referência aqui foi inventada.

export const REFERENCIAS: Record<string, Referencia[]> = {
  'Regressão Logística': [
    { autores: 'Hosmer, D. W., Lemeshow, S. & Sturdivant, R. X.', ano: '2013', titulo: 'Applied Logistic Regression (3ª ed.)', veiculo: 'Wiley' },
    { autores: 'Hastie, T., Tibshirani, R. & Friedman, J.', ano: '2009', titulo: 'The Elements of Statistical Learning (2ª ed.)', veiculo: 'Springer' },
  ],
  'Regressão Linear': [
    { autores: 'Hastie, T., Tibshirani, R. & Friedman, J.', ano: '2009', titulo: 'The Elements of Statistical Learning (2ª ed.)', veiculo: 'Springer' },
  ],
  'Árvore de Decisão': [
    { autores: 'Breiman, L., Friedman, J., Olshen, R. & Stone, C.', ano: '1984', titulo: 'Classification and Regression Trees', veiculo: 'Wadsworth' },
  ],
  GAM: [
    { autores: 'Wood, S. N.', ano: '2017', titulo: 'Generalized Additive Models: An Introduction with R (2ª ed.)', veiculo: 'CRC Press' },
    { autores: 'Hastie, T. & Tibshirani, R.', ano: '1990', titulo: 'Generalized Additive Models', veiculo: 'Chapman & Hall' },
  ],
  'Random Forest': [
    { autores: 'Breiman, L.', ano: '2001', titulo: 'Random Forests', veiculo: 'Machine Learning, 45(1)' },
  ],
  'Gradient Boosting': [
    { autores: 'Friedman, J. H.', ano: '2001', titulo: 'Greedy Function Approximation: A Gradient Boosting Machine', veiculo: 'Annals of Statistics, 29(5)' },
    { autores: 'Chen, T. & Guestrin, C.', ano: '2016', titulo: 'XGBoost: A Scalable Tree Boosting System', veiculo: 'Proceedings of the 22nd ACM SIGKDD (KDD)' },
  ],
  XGBoost: [
    { autores: 'Chen, T. & Guestrin, C.', ano: '2016', titulo: 'XGBoost: A Scalable Tree Boosting System', veiculo: 'Proceedings of the 22nd ACM SIGKDD (KDD)' },
  ],
  LightGBM: [
    { autores: 'Ke, G. et al.', ano: '2017', titulo: 'LightGBM: A Highly Efficient Gradient Boosting Decision Tree', veiculo: 'Advances in Neural Information Processing Systems (NeurIPS)' },
  ],
  CatBoost: [
    { autores: 'Prokhorenkova, L. et al.', ano: '2018', titulo: 'CatBoost: Unbiased Boosting with Categorical Features', veiculo: 'Advances in Neural Information Processing Systems (NeurIPS)' },
  ],
  'k-NN': [
    { autores: 'Cover, T. & Hart, P.', ano: '1967', titulo: 'Nearest Neighbor Pattern Classification', veiculo: 'IEEE Transactions on Information Theory, 13(1)' },
  ],
  Lasso: [
    { autores: 'Tibshirani, R.', ano: '1996', titulo: 'Regression Shrinkage and Selection via the Lasso', veiculo: 'Journal of the Royal Statistical Society B, 58(1)' },
  ],
  Ridge: [
    { autores: 'Hoerl, A. E. & Kennard, R. W.', ano: '1970', titulo: 'Ridge Regression: Biased Estimation for Nonorthogonal Problems', veiculo: 'Technometrics, 12(1)' },
  ],
  'Elastic Net': [
    { autores: 'Zou, H. & Hastie, T.', ano: '2005', titulo: 'Regularization and Variable Selection via the Elastic Net', veiculo: 'Journal of the Royal Statistical Society B, 67(2)' },
  ],
  PCA: [
    { autores: 'Jolliffe, I. T. & Cadima, J.', ano: '2016', titulo: 'Principal Component Analysis: A Review and Recent Developments', veiculo: 'Philosophical Transactions of the Royal Society A, 374' },
  ],
  'ARIMA/Prophet': [
    { autores: 'Box, G. E. P. & Jenkins, G. M.', ano: '1970', titulo: 'Time Series Analysis: Forecasting and Control', veiculo: 'Holden-Day' },
    { autores: 'Taylor, S. J. & Letham, B.', ano: '2018', titulo: 'Forecasting at Scale', veiculo: 'The American Statistician, 72(1)' },
  ],
  'LSTM/Transformer': [
    { autores: 'Hochreiter, S. & Schmidhuber, J.', ano: '1997', titulo: 'Long Short-Term Memory', veiculo: 'Neural Computation, 9(8)' },
    { autores: 'Vaswani, A. et al.', ano: '2017', titulo: 'Attention Is All You Need', veiculo: 'Advances in Neural Information Processing Systems (NeurIPS)' },
  ],
  'Embeddings + Modelo Supervisionado': [
    { autores: 'Devlin, J., Chang, M.-W., Lee, K. & Toutanova, K.', ano: '2019', titulo: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', veiculo: 'Proceedings of NAACL-HLT' },
  ],
  'CNN com Transfer Learning': [
    { autores: 'He, K., Zhang, X., Ren, S. & Sun, J.', ano: '2016', titulo: 'Deep Residual Learning for Image Recognition', veiculo: 'Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)' },
    { autores: 'Yosinski, J., Clune, J., Bengio, Y. & Lipson, H.', ano: '2014', titulo: 'How Transferable Are Features in Deep Neural Networks?', veiculo: 'Advances in Neural Information Processing Systems (NeurIPS)' },
  ],
  'K-means': [
    { autores: 'Lloyd, S.', ano: '1982', titulo: 'Least Squares Quantization in PCM', veiculo: 'IEEE Transactions on Information Theory, 28(2)' },
    { autores: 'MacQueen, J.', ano: '1967', titulo: 'Some Methods for Classification and Analysis of Multivariate Observations', veiculo: 'Proceedings of the 5th Berkeley Symposium' },
  ],
  'DBSCAN/HDBSCAN': [
    { autores: 'Ester, M., Kriegel, H.-P., Sander, J. & Xu, X.', ano: '1996', titulo: 'A Density-Based Algorithm for Discovering Clusters in Large Spatial Databases with Noise', veiculo: 'Proceedings of KDD' },
    { autores: 'Campello, R. J. G. B., Moulavi, D. & Sander, J.', ano: '2013', titulo: 'Density-Based Clustering Based on Hierarchical Density Estimates', veiculo: 'Proceedings of PAKDD' },
  ],
  'Clustering Hierárquico': [
    { autores: 'Ward, J. H.', ano: '1963', titulo: 'Hierarchical Grouping to Optimize an Objective Function', veiculo: 'Journal of the American Statistical Association, 58(301)' },
  ],
  'UMAP/t-SNE': [
    { autores: 'McInnes, L., Healy, J. & Melville, J.', ano: '2018', titulo: 'UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction', veiculo: 'arXiv:1802.03426' },
    { autores: 'van der Maaten, L. & Hinton, G.', ano: '2008', titulo: 'Visualizing Data using t-SNE', veiculo: 'Journal of Machine Learning Research, 9' },
  ],
  'Isolation Forest/One-Class SVM': [
    { autores: 'Liu, F. T., Ting, K. M. & Zhou, Z.-H.', ano: '2008', titulo: 'Isolation Forest', veiculo: 'Proceedings of the 8th IEEE International Conference on Data Mining (ICDM)' },
    { autores: 'Schölkopf, B. et al.', ano: '2001', titulo: 'Estimating the Support of a High-Dimensional Distribution', veiculo: 'Neural Computation, 13(7)' },
  ],
  'Filtragem Colaborativa': [
    { autores: 'Koren, Y., Bell, R. & Volinsky, C.', ano: '2009', titulo: 'Matrix Factorization Techniques for Recommender Systems', veiculo: 'IEEE Computer, 42(8)' },
  ],
  'Recomendação Híbrida': [
    { autores: 'Burke, R.', ano: '2002', titulo: 'Hybrid Recommender Systems: Survey and Experiments', veiculo: 'User Modeling and User-Adapted Interaction, 12(4)' },
  ],
}

// Referências para intervenções do Fluxo B (diagnóstico/otimização)
export const REFERENCIAS_DIAGNOSTICO: Record<string, Referencia[]> = {
  Overfitting: [
    { autores: 'Srivastava, N. et al.', ano: '2014', titulo: 'Dropout: A Simple Way to Prevent Neural Networks from Overfitting', veiculo: 'Journal of Machine Learning Research, 15' },
    { autores: 'Hastie, T., Tibshirani, R. & Friedman, J.', ano: '2009', titulo: 'The Elements of Statistical Learning (2ª ed.)', veiculo: 'Springer' },
  ],
  Underfitting: [
    { autores: 'Goodfellow, I., Bengio, Y. & Courville, A.', ano: '2016', titulo: 'Deep Learning', veiculo: 'MIT Press' },
  ],
  'Problema de escala': [
    { autores: 'Hastie, T., Tibshirani, R. & Friedman, J.', ano: '2009', titulo: 'The Elements of Statistical Learning (2ª ed.)', veiculo: 'Springer' },
  ],
  'Engenharia de atributos insuficiente': [
    { autores: 'Zheng, A. & Casari, A.', ano: '2018', titulo: 'Feature Engineering for Machine Learning', veiculo: "O'Reilly Media" },
  ],
  'Alta dimensionalidade': [
    { autores: 'Zou, H. & Hastie, T.', ano: '2005', titulo: 'Regularization and Variable Selection via the Elastic Net', veiculo: 'Journal of the Royal Statistical Society B, 67(2)' },
    { autores: 'Jolliffe, I. T. & Cadima, J.', ano: '2016', titulo: 'Principal Component Analysis: A Review and Recent Developments', veiculo: 'Philosophical Transactions of the Royal Society A, 374' },
  ],
  'Desbalanceamento de classes': [
    { autores: 'Chawla, N. V., Bowyer, K. W., Hall, L. O. & Kegelmeyer, W. P.', ano: '2002', titulo: 'SMOTE: Synthetic Minority Over-sampling Technique', veiculo: 'Journal of Artificial Intelligence Research, 16' },
  ],
  'Problema na dinâmica de treino': [
    { autores: 'Smith, L. N.', ano: '2017', titulo: 'Cyclical Learning Rates for Training Neural Networks', veiculo: 'Proceedings of the IEEE Winter Conference on Applications of Computer Vision (WACV)' },
  ],
  'Necessidade de tuning': [
    { autores: 'Bergstra, J. & Bengio, Y.', ano: '2012', titulo: 'Random Search for Hyper-Parameter Optimization', veiculo: 'Journal of Machine Learning Research, 13' },
    { autores: 'Snoek, J., Larochelle, H. & Adams, R. P.', ano: '2012', titulo: 'Practical Bayesian Optimization of Machine Learning Algorithms', veiculo: 'Advances in Neural Information Processing Systems (NeurIPS)' },
  ],
  'Variância residual alta': [
    { autores: 'Dietterich, T. G.', ano: '2000', titulo: 'Ensemble Methods in Machine Learning', veiculo: 'Proceedings of the 1st International Workshop on Multiple Classifier Systems' },
  ],
  'Possível data leakage': [
    { autores: 'Kaufman, S., Rosset, S., Perlich, C. & Stitelman, O.', ano: '2012', titulo: 'Leakage in Data Mining: Formulation, Detection, and Avoidance', veiculo: 'ACM Transactions on Knowledge Discovery from Data, 6(4)' },
  ],
  'Métrica desalinhada com o objetivo': [
    { autores: 'Powers, D. M. W.', ano: '2011', titulo: 'Evaluation: From Precision, Recall and F-Measure to ROC, Informedness, Markedness and Correlation', veiculo: 'Journal of Machine Learning Technologies, 2(1)' },
  ],
}
