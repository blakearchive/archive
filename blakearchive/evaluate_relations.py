__author__ = 'thomasj'

import pandas as pd
import argparse
import logging
import numpy as np


logging.basicConfig()
logger = logging.getLogger('blake_relations')
logger.setLevel(-1)
logger.info('Blake relations')

id_cols = ['desc_id', 'dbi', 'bad_id', 'virtual_group']

keys = ['same_matrix_ids',
'same_production_sequence_ids',
'similar_design_ids',
'reference_object_ids',
'reference_copy_ids',
'reference_work_ids',
'supplemental_ids']


def load(file_name):
    """loads file, checks for required columns"""

    df = pd.read_csv(file_name)
    for col in keys + id_cols:
        assert col in df, "{} not in {}".format(col, file_name)
    return df


def check_relations(df):

    result = {k:None for k in keys}
    for k in keys:
        key_df = pd.DataFrame(index=df.index, columns=df.index)
        error_lst = []
        for desc_id, row in df[[k]].iterrows():
            if isinstance(desc_id, basestring):
                try:
                    desc_ids = row.str.split(',')[k]
                    if isinstance(desc_ids, list):
                        # any relationship not inserted into the index will be dropped forever,
                        # so we need to fail and force the user to fix the input file
                        try:
                            key_df.loc[[desc_id], desc_ids] = True
                            key_df.loc[desc_ids, [desc_id]] = True  # make link in both directions, a->b and b->a
                        except KeyError as e:
                           error_lst.append((k, desc_id, desc_ids))

                except ValueError as e:
                    assert np.isnan(desc_ids) # TODO: is this right?

    return pd.DataFrame(error_lst, columns=['key','row','error'])


def main(args):

    df = load(args.file)

    if len(df) != len(df.drop_duplicates(subset='desc_id', keep='first')):
        logger.error('{} contains duplicate desc_ids'.format(args.file))
        logger.error('counts per desc_id: {}'.format(df.groupby('desc_id')
                                                    .size()
                                                    .sort_values(ascending=False)
                                                    .head(15)))

    df.set_index('desc_id', inplace=True)

    relations_errors = check_relations(df)
    logger.info(relations_errors)

    if len(relations_errors) > 0:
        logger.error('{} has errors in desc_id formats'.format(relations_errors))



if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Process a blake_relations.csv file to make all mappings reciprocal')
    parser.add_argument("file", nargs='?')

    main(parser.parse_args())